import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { app } from '../../app.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../setup.js';
import { User } from '../../models/User.js';

let authToken: string;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  
  // Register a user to get a valid token
  const res = await request(app).post('/api/auth/register').send({
    name: 'Content Creator',
    email: 'creator@example.com',
    password: 'password123'
  });
  authToken = res.body.token;
});

describe('Content API Endpoints', () => {
  it('should reject unauthenticated requests to GET /api/content', async () => {
    const res = await request(app).get('/api/content');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow authenticated GET /api/content', async () => {
    const res = await request(app)
      .get('/api/content')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.contents).toBeInstanceOf(Array);
  });

  it('should create new content successfully', async () => {
    const res = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'New Integration Test Post',
        body: 'Testing content creation.',
        category: 'Blog Post',
        status: 'draft'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.content.title).toBe('New Integration Test Post');
  });

  it('should fail creation with invalid data (Zod validation)', async () => {
    const res = await request(app)
      .post('/api/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '', // Invalid empty title
        body: 'Testing validation.'
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Validation Error');
  });
});
