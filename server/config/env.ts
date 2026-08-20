import 'dotenv/config';

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const INSECURE_JWT_PLACEHOLDERS = [
  'your_jwt_secret_here',
  'your_jwt_secret_key_here',
  'your_super_secret_jwt_key',
];

const INSECURE_GEMINI_PLACEHOLDERS = [
  'your_gemini_api_key_here',
  'MISSING_KEY',
];

/**
 * Resolves the JWT secret securely based on the execution environment.
 * 
 * - Production (NODE_ENV === 'production'):
 *   Must have process.env.JWT_SECRET set to a valid, non-placeholder value.
 *   Fails fast by throwing an Error if missing or set to an insecure placeholder.
 * 
 * - Development / Testing (NODE_ENV !== 'production'):
 *   Uses process.env.JWT_SECRET if supplied.
 *   Falls back to 'development-only-fallback-secret' for local convenience if missing.
 */
export function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET;
  const currentEnv = process.env.NODE_ENV || 'development';
  const isProduction = currentEnv === 'production';

  if (isProduction) {
    if (!envSecret || envSecret.trim() === '' || INSECURE_JWT_PLACEHOLDERS.includes(envSecret.trim())) {
      throw new Error('FATAL: JWT_SECRET environment variable must be explicitly configured in production mode.');
    }
    return envSecret;
  }

  // Development / Test environment fallback
  return envSecret || 'development-only-fallback-secret';
}

/**
 * Exported JWT_SECRET variable for backward compatibility.
 * Evaluates getJwtSecret() dynamically.
 */
export const JWT_SECRET = getJwtSecret();

/**
 * Validates critical environment variables on startup.
 * Ensures the application fails cleanly if required secrets are missing in production.
 */
export function validateEnv(): void {
  // Validate JWT_SECRET (will throw in production if missing or placeholder)
  const secret = getJwtSecret();
  const currentEnv = process.env.NODE_ENV || 'development';

  if (!process.env.JWT_SECRET && currentEnv !== 'production') {
    console.warn('⚠️ WARNING: JWT_SECRET is not set. Using development-only fallback key for development environment.');
  }

  // 2. Validate GEMINI_API_KEY
  if (!process.env.GEMINI_API_KEY || INSECURE_GEMINI_PLACEHOLDERS.includes(process.env.GEMINI_API_KEY.trim())) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not configured. AI generation endpoints will return service configuration errors if invoked.');
  } else {
    console.log('✅ GEMINI_API_KEY configured successfully.');
  }

  // 3. Database configuration status
  if (MONGODB_URI) {
    console.log('✅ MONGODB_URI configured.');
  } else {
    console.log('ℹ️ MONGODB_URI not set. System will connect to local MongoDB or fallback to MongoMemoryServer.');
  }
}
