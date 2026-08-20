import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { User } from '../../models/User.js';
import { connectTestDB, closeTestDB, clearTestDB } from '../setup.js';

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('User Model (Password Hashing & Async/Await Error Handling)', () => {
  it('should hash the password before saving to the database', async () => {
    const rawPassword = 'supersecretpassword';
    const user = new User({
      name: 'Hash Test User',
      email: 'hash@example.com',
      password: rawPassword,
    });

    await user.save();

    expect(user.password).toBeDefined();
    expect(user.password).not.toBe(rawPassword);
  });

  it('should return true for comparePassword with the correct password', async () => {
    const rawPassword = 'correctpassword';
    const user = new User({
      name: 'Compare Test',
      email: 'compare@example.com',
      password: rawPassword,
    });
    await user.save();

    // Fetch user explicitly with password selected (since schema has select: false by default)
    const fetchedUser = await User.findById(user._id).select('+password');
    expect(fetchedUser).toBeDefined();

    if (fetchedUser) {
      const isMatch = await fetchedUser.comparePassword(rawPassword);
      expect(isMatch).toBe(true);
    }
  });

  it('should return false for comparePassword with incorrect password', async () => {
    const user = new User({
      name: 'Wrong Pass Test',
      email: 'wrongpass@example.com',
      password: 'mypassword',
    });
    await user.save();

    const fetchedUser = await User.findById(user._id).select('+password');
    if (fetchedUser) {
      const isMatch = await fetchedUser.comparePassword('incorrectpassword');
      expect(isMatch).toBe(false);
    }
  });

  /**
   * ASYNC / AWAIT & TRY-CATCH ERROR HANDLING DEMONSTRATION:
   * 
   * 1. Test function is marked `async`.
   * 2. `invalidUser.save()` returns a Mongoose Promise.
   * 3. `await` pauses execution of this test function until the Promise settles.
   * 4. Validation failure (missing required `email` field) causes the Promise to reject and throw.
   * 5. Execution control immediately transfers to the `catch (error)` block.
   * 6. The caught `error` object is inspected and asserted (`error.name === 'ValidationError'`).
   * 7. The test passes cleanly because the expected rejection was caught and verified.
   */
  it('should catch and assert Mongoose ValidationError when saving user without required email using try/catch', async () => {
    const invalidUser = new User({
      name: 'Missing Email User',
      password: 'password123',
      // 'email' is required by User schema but intentionally omitted here
    });

    try {
      await invalidUser.save();
      // If save() unexpectedly succeeds, fail the test
      expect.fail('Expected Mongoose ValidationError but user.save() succeeded.');
    } catch (error: any) {
      // Catch and assert the rejected Promise error object
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.errors).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.email.kind).toBe('required');
    }
  });

  it('should catch and assert duplicate key error on duplicate email registration using try/catch', async () => {
    // Register initial user
    await User.create({
      name: 'Original User',
      email: 'duplicate@example.com',
      password: 'password123',
    });

    // Attempt to register second user with identical email
    const duplicateUser = new User({
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: 'password456',
    });

    try {
      await duplicateUser.save();
      expect.fail('Expected Mongo duplicate key error but duplicateUser.save() succeeded.');
    } catch (error: any) {
      // Assert MongoDB E11000 duplicate key error code
      expect(error).toBeDefined();
      expect(error.code).toBe(11000);
      expect(error.keyPattern).toBeDefined();
      expect(error.keyPattern.email).toBe(1);
    }
  });
});
