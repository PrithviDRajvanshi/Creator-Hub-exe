import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../../app.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../setup.js';
import { User } from '../../models/User.js';

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  
  // Register a regular user
  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Normal User',
    email: 'user@example.com',
    password: 'password123'
  });
  userToken = userRes.body.token;

  // Create an Admin user directly in DB
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'ADMIN'
  });

  // Login as admin
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'adminpassword'
  });
  adminToken = adminRes.body.token;
});

describe('Authorization & Admin Endpoints', () => {
  it('should deny access to /api/admin/users for regular USER', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('is not authorized');
  });

  it('should allow access to /api/admin/users for ADMIN', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.users).toBeInstanceOf(Array);
  });
});
