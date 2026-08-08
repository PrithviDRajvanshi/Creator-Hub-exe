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

describe('User Model (Password Hashing)', () => {
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
});
