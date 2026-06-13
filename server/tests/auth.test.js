const { connect, clearDatabase, closeDatabase } = require('./setup');
const { app, request } = require('./helpers');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Jane', email: 'jane@apexmarket.io', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane@apexmarket.io');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.role).toBe('staff');
    });

    it('rejects duplicate emails', async () => {
      const payload = { name: 'Jane', email: 'dup@apexmarket.io', password: 'secret123' };
      await request(app).post('/api/auth/register').send(payload);
      const res = await request(app).post('/api/auth/register').send(payload);
      expect(res.status).toBe(409);
    });

    it('validates input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Ada', email: 'ada@apexmarket.io', password: 'secret123' });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ada@apexmarket.io', password: 'secret123' });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ada@apexmarket.io', password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
