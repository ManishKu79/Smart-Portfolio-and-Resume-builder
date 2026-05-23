const mongoose = require('mongoose');
const User = require('../../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Connection already handled by jest.setup.js
  });

  afterAll(async () => {
    // Cleanup handled by jest.setup.js
  });

  describe('User Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password);
    });

    it('should fail without required fields', async () => {
      const user = new User({});
      let error;
      
      try {
        await user.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });
  });
});