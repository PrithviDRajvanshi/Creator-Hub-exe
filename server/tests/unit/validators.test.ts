import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../../validators/authValidator.js';
import { createContentSchema } from '../../validators/contentValidator.js';

describe('Authentication Validation Schemas', () => {
  it('should validate a correct registration payload', () => {
    const validRegister = registerSchema.safeParse({
      name: 'Test Creator',
      email: 'test@creator.com',
      password: 'password123',
    });
    expect(validRegister.success).toBe(true);
  });

  it('should fail registration validation for invalid payload', () => {
    const invalidRegister = registerSchema.safeParse({
      name: 'A',
      email: 'invalid-email',
      password: '123',
    });
    expect(invalidRegister.success).toBe(false);
  });

  it('should validate a correct login payload', () => {
    const validLogin = loginSchema.safeParse({
      email: 'test@creator.com',
      password: 'password123',
    });
    expect(validLogin.success).toBe(true);
  });
});

describe('Content Validation Schema', () => {
  it('should validate a correct content payload', () => {
    const validContent = createContentSchema.safeParse({
      title: 'My First Post',
      body: 'This is the content body of my post.',
      category: 'Blog Post',
      tags: ['Tech', 'React'],
      status: 'draft',
    });
    expect(validContent.success).toBe(true);
  });

  it('should fail validation for empty content title/body', () => {
    const invalidContent = createContentSchema.safeParse({
      title: '',
      body: '',
    });
    expect(invalidContent.success).toBe(false);
  });
});
