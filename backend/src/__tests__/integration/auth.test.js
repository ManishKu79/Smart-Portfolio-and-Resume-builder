const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should return 201 when registration is successful', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: `test-${Date.now()}@example.com`,
          password: 'test123456'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 when email already exists', async () => {
      const email = `duplicate-${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email,
          password: 'test123456'
        });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email,
          password: 'test123456'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    let testPassword = 'login123456';

    beforeEach(async () => {
      testEmail = `login-${Date.now()}@example.com`;
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: testEmail,
          password: testPassword
        });
    });

    it('should return 200 with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    let authToken;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Protected User',
          email: `protected-${Date.now()}@example.com`,
          password: 'protected123'
        });
      
      authToken = registerResponse.body.data.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });
  });
});