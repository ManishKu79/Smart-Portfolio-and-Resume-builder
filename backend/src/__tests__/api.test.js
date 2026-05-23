const request = require('supertest');
const app = require('../app');

describe('API Health Check', () => {
  it('should return 200 on health endpoint', async () => {
    const response = await request(app)
      .get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});