const authController = require('../../../controllers/authController');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: null,
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest-test' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Registration successful')
        })
      );
    });

    it('should fail with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });
      
      req.body = {
        name: 'Another User',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await authController.register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('already exists')
        })
      );
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'correctpassword'
      });
    });

    it('should login successfully with correct credentials', async () => {
      req.body = {
        email: 'login@example.com',
        password: 'correctpassword'
      };
      
      jwt.sign.mockReturnValue('mock-token');
      
      await authController.login(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful'
        })
      );
    });

    it('should fail with incorrect password', async () => {
      req.body = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid')
        })
      );
    });

    it('should fail with non-existent email', async () => {
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password'
      };
      
      await authController.login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid')
        })
      );
    });
  });
});