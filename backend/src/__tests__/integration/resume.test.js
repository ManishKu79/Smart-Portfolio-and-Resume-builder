const request = require('supertest');
const app = require('../../../src/app');
const Resume = require('../../../src/models/Resume');

describe('Resume API Integration Tests', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Resume Test User',
        email: 'resume-test@example.com',
        password: 'resume123456'
      });
    
    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user._id;
  });

  describe('POST /api/resumes', () => {
    it('should create a new resume', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Professional Resume',
          template: 'modern',
          personalInfo: {
            fullName: 'John Smith',
            jobTitle: 'Software Engineer',
            email: 'john@example.com'
          }
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('My Professional Resume');
      expect(response.body.data.userId).toBe(userId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({
          title: 'Unauthorized Resume'
        });
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/resumes', () => {
    beforeEach(async () => {
      await Resume.create({
        userId,
        title: 'Resume 1',
        personalInfo: { fullName: 'Test User' }
      });
      await Resume.create({
        userId,
        title: 'Resume 2',
        personalInfo: { fullName: 'Test User' }
      });
    });

    it('should get all resumes for authenticated user', async () => {
      const response = await request(app)
        .get('/api/resumes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resumes).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/resumes?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.resumes).toHaveLength(1);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(2);
    });
  });

  describe('PUT /api/resumes/:id', () => {
    let resumeId;

    beforeEach(async () => {
      const resume = await Resume.create({
        userId,
        title: 'Original Title',
        personalInfo: { fullName: 'Test User' }
      });
      resumeId = resume._id;
    });

    it('should update resume', async () => {
      const response = await request(app)
        .put(`/api/resumes/${resumeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent resume', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/resumes/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title'
        });
      
      expect(response.status).toBe(404);
    });
  });
});