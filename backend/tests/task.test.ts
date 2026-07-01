import request from 'supertest';
import app from '../src/index';

const VALID_API_KEY = process.env.N8N_API_KEY ?? 'test-n8n-api-key-1234';

describe('Task Routes — Auth guards', () => {
  it('GET /api/tasks returns 401 without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('POST /api/tasks returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test task' });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/tasks/:id returns 401 without token', async () => {
    const res = await request(app)
      .patch('/api/tasks/some-id')
      .send({ title: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/tasks/:id returns 401 without token', async () => {
    const res = await request(app).delete('/api/tasks/some-id');
    expect(res.status).toBe(401);
  });
});

describe('Task Routes — Validation', () => {
  it('POST /api/tasks/from-email returns 401 without API key', async () => {
    const res = await request(app)
      .post('/api/tasks/from-email')
      .send({ title: 'Test', sender_email: 'test@example.com' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_API_KEY');
  });

  it('POST /api/tasks/from-email returns 400 with API key but invalid body', async () => {
    const res = await request(app)
      .post('/api/tasks/from-email')
      .set('x-api-key', VALID_API_KEY)
      .send({ title: '' }); // missing sender_email, empty title
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/tasks/summary returns 401 without API key', async () => {
    const res = await request(app).get('/api/tasks/summary');
    expect(res.status).toBe(401);
  });
});

describe('Task Routes — Query validation', () => {
  it('GET /api/tasks with invalid status returns 401 (auth checked first)', async () => {
    const res = await request(app).get('/api/tasks?status=invalid');
    expect(res.status).toBe(401);
  });
});

describe('Not Found', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
