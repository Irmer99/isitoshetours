const request = require('supertest');
const app = require('../app');

describe('Health Endpoint', () => {
  it('GET /health should return 200 or 503', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
  });
});
