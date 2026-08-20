import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../../app.js';
import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import prisma from '../../config/prisma.js';
import { getJwtSecret } from '../../config/env.js';

let mongoServer: MongoMemoryServer;
let testToken: string;
let testUserId: string;
let testUserEmail: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Setup Test User in Mongo
  const user = await User.create({
    name: 'Billing Test User',
    email: 'billingtest@example.com',
    password: 'password123',
    role: 'USER',
  });
  testUserId = user._id.toString();
  testUserEmail = user.email;

  // Generate Token
  const secret = getJwtSecret();
  testToken = jwt.sign({ id: testUserId, role: 'USER' }, secret, {
    expiresIn: '1h',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clear Postgres test data EXCEPT plans
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});
});

describe('Billing API', () => {
  describe('GET /api/billing/plans', () => {
    it('should return available plans with features', async () => {
      const res = await request(app).get('/api/billing/plans');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('price');
      expect(res.body[0]).toHaveProperty('features');
      expect(Array.isArray(res.body[0].features)).toBe(true);
    });
  });

  describe('POST /api/billing/subscribe', () => {
    it('should successfully subscribe to a plan and create a payment', async () => {
      const plans = await prisma.plan.findMany();
      const plan = plans[0];

      const res = await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ planId: plan.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('subscription');
      expect(res.body).toHaveProperty('payment');
      expect(res.body.subscription.userId).toBe(testUserId);
      expect(res.body.subscription.planId).toBe(plan.id);
      expect(res.body.payment.status).toBe('success');

      // Verify lazy user creation in postgres
      const pgUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(pgUser).not.toBeNull();
      expect(pgUser?.email).toBe(testUserEmail);
    });

    it('should fail transaction and rollback if an error occurs inside the transaction block', async () => {
      // 1. Verify user does not exist initially
      let pgUser = await prisma.user.findUnique({ where: { id: 'rollback-test-user' } });
      expect(pgUser).toBeNull();

      // 2. Attempt a transaction that creates a user but then intentionally fails
      try {
        await prisma.$transaction(async (tx) => {
          // Create the user inside the transaction
          await tx.user.create({
            data: { id: 'rollback-test-user', email: 'rollback@example.com' },
          });

          // Verify the user exists within the transaction context
          const userInTx = await tx.user.findUnique({ where: { id: 'rollback-test-user' } });
          expect(userInTx).not.toBeNull();

          // Intentionally throw an error to trigger a rollback
          throw new Error('Intentional Transaction Failure');
        });
      } catch (err: any) {
        expect(err.message).toBe('Intentional Transaction Failure');
      }

      // 3. Verify the user does NOT exist after the rollback
      pgUser = await prisma.user.findUnique({ where: { id: 'rollback-test-user' } });
      expect(pgUser).toBeNull();
    });
  });

  describe('GET /api/billing/history', () => {
    it('should retrieve billing history using explicit raw SQL JOIN', async () => {
      // First, subscribe
      const plans = await prisma.plan.findMany();
      await request(app)
        .post('/api/billing/subscribe')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ planId: plans[0].id });

      // Then fetch history
      const res = await request(app)
        .get('/api/billing/history')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      
      const historyItem = res.body[0];
      // These keys must match the exact aliases from the raw SQL JOIN query
      expect(historyItem).toHaveProperty('email', testUserEmail);
      expect(historyItem).toHaveProperty('subscriptionId');
      expect(historyItem).toHaveProperty('planName', plans[0].name);
      expect(historyItem).toHaveProperty('paymentStatus', 'success');
    });
  });
});
