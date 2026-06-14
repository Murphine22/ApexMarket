const { connect, clearDatabase, closeDatabase } = require('./setup');
const { app, request, createUser } = require('./helpers');
const Product = require('../src/models/Product');

beforeAll(connect);
afterEach(clearDatabase);
afterAll(closeDatabase);

async function seedProduct(stock = 10) {
  return Product.create({
    sku: 'PRD-7001',
    name: 'Test Soda',
    category: 'Beverages',
    price: 2,
    cost: 1,
    stock,
    lowStockThreshold: 3,
  });
}

describe('Transactions API', () => {
  it('completes a sale, decrements stock and computes totals', async () => {
    const { token } = await createUser({ role: 'staff' });
    await seedProduct(10);

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentMethod: 'card', items: [{ sku: 'PRD-7001', quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(res.body.data.subtotal).toBe(6);
    expect(res.body.data.tax).toBeCloseTo(0.48, 2);
    expect(res.body.data.total).toBeCloseTo(6.48, 2);

    const product = await Product.findOne({ sku: 'PRD-7001' });
    expect(product.stock).toBe(7);
  });

  it('rejects a sale exceeding available stock (no stock mutation)', async () => {
    const { token } = await createUser({ role: 'staff' });
    await seedProduct(2);

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentMethod: 'cash', items: [{ sku: 'PRD-7001', quantity: 5 }] });

    expect(res.status).toBe(400);
    const product = await Product.findOne({ sku: 'PRD-7001' });
    expect(product.stock).toBe(2);
  });

  it('validates the payment method', async () => {
    const { token } = await createUser({ role: 'staff' });
    await seedProduct(10);
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ paymentMethod: 'bitcoin', items: [{ sku: 'PRD-7001', quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ paymentMethod: 'card', items: [{ sku: 'PRD-7001', quantity: 1 }] });
    expect(res.status).toBe(401);
  });
});
