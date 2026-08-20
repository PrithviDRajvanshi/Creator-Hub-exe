import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getJwtSecret, INSECURE_JWT_PLACEHOLDERS } from '../../config/env.js';

describe('JWT Secret Environment & Security Resolution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use process.env.JWT_SECRET when configured in development mode', () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'custom_dev_secret_key_12345';

    const secret = getJwtSecret();
    expect(secret).toBe('custom_dev_secret_key_12345');
  });

  it('should use development fallback secret when JWT_SECRET is missing in development mode', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;

    const secret = getJwtSecret();
    expect(secret).toBe('development-only-fallback-secret');
    expect(secret).not.toBe('');
  });

  it('should throw a fatal configuration error when JWT_SECRET is missing in production mode', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    expect(() => getJwtSecret()).toThrowError(
      'FATAL: JWT_SECRET environment variable must be explicitly configured in production mode.'
    );
  });

  it('should throw a fatal error when JWT_SECRET uses an insecure placeholder in production mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = INSECURE_JWT_PLACEHOLDERS[0];

    expect(() => getJwtSecret()).toThrowError(
      'FATAL: JWT_SECRET environment variable must be explicitly configured in production mode.'
    );
  });

  it('should use the configured JWT_SECRET when properly set in production mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'super_secure_production_jwt_signing_key_2026';

    const secret = getJwtSecret();
    expect(secret).toBe('super_secure_production_jwt_signing_key_2026');
  });
});
