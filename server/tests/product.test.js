const { connect, clearDatabase, closeDatabase } = require('./setup');
const { app, request, createUser } = require('./helpers');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

const sample = {
  sku: 'PRD-9001',
  name: 'Test Apple',
  category: 'Produce',
  price: 1.5,
  cost: 0.5,
  stock: 20,
  lowStockThreshold: 5,
};

describe('Products API (RBAC)', () => {
  it('requires auth to list products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });

  it('allows staff to list products', async () => {
    const { token } = await createUser({ role: 'staff' });
    const res = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('forbids staff from creating products', async () => {
    const { token } = await createUser({ role: 'staff' });
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(403);
  });

  it('allows admin to create a product and writes a restock log', async () => {
    const { token } = await createUser({ role: 'admin' });
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sample);
    expect(res.status).toBe(201);
    expect(res.body.data.sku).toBe('PRD-9001');

    const logs = await request(app)
      .get('/api/inventory/logs')
      .set('Authorization', `Bearer ${token}`);
    expect(logs.body.data.some((l) => l.movementType === 'restock')).toBe(true);
  });

  it('validates product payloads', async () => {
    const { token } = await createUser({ role: 'admin' });
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'No price' });
    expect(res.status).toBe(400);
  });

  it('admin can update and delete a product', async () => {
    const { token } = await createUser({ role: 'admin' });
    const created = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(sample);
    const id = created.body.data._id || created.body.data.id;

    const updated = await request(app)
      .put(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 2.75 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.price).toBe(2.75);

    const deleted = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleted.status).toBe(200);
  });
});
