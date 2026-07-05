// tests/product.test.js — Product CRUD endpoint tests
//
// Tests cover:
// 1. Product creation with valid category
// 2. Product creation with invalid category (should fail)
// 3. Product listing with pagination (verifies server-side pagination)
// 4. Product update
// 5. Product deletion
// 6. Category deletion blocked when products exist (409 Conflict)

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User, Category, Product } = require('../models');

let authToken;
let testCategoryId;

beforeAll(async () => {
  // Sync database (recreate tables)
  await sequelize.sync({ force: true });

  // Register and login to get a JWT for protected routes
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'product-test@example.com', password: 'TestPass123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'product-test@example.com', password: 'TestPass123' });

  authToken = loginRes.body.token;

  // Create a test category
  const catRes = await request(app)
    .post('/api/categories')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Test Category' });

  testCategoryId = catRes.body.data.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/products', () => {
  it('should create a product with a valid category', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        price: 29.99,
        categoryId: testCategoryId
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Product');
    expect(parseFloat(res.body.data.price)).toBe(29.99);
    expect(res.body.data.categoryId).toBe(testCategoryId);
    expect(res.body.data.uniqueId).toBeDefined();
  });

  it('should reject product with non-existent category', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Bad Product',
        price: 10.00,
        categoryId: 99999  // Non-existent category
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('does not exist');
  });

  it('should reject product with missing required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'No Price Product' }); // Missing price and categoryId

    expect(res.status).toBe(400);
  });

  it('should reject product with negative price', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Negative Price',
        price: -5.00,
        categoryId: testCategoryId
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/products', () => {
  beforeAll(async () => {
    // Create multiple products for pagination testing
    for (let i = 1; i <= 25; i++) {
      await Product.create({
        name: `Product ${i}`,
        price: i * 10,
        categoryId: testCategoryId
      });
    }
  });

  it('should return paginated results with correct metadata', async () => {
    const res = await request(app)
      .get('/api/products?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.total).toBeDefined();
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBeDefined();
    // total should be >= 25 (we created 25 + 1 from the creation test)
    expect(res.body.total).toBeGreaterThanOrEqual(25);
  });

  it('should return second page with different results', async () => {
    const page1 = await request(app)
      .get('/api/products?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    const page2 = await request(app)
      .get('/api/products?page=2&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(page2.status).toBe(200);
    // Page 2 should have different products than page 1
    const page1Ids = page1.body.data.map((p) => p.id);
    const page2Ids = page2.body.data.map((p) => p.id);
    // No overlap between pages
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap.length).toBe(0);
  });

  it('should sort by price ascending', async () => {
    const res = await request(app)
      .get('/api/products?sort=price&order=asc&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    const prices = res.body.data.map((p) => parseFloat(p.price));
    // Verify prices are in ascending order
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it('should search by product name (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/products?search=product%201&limit=50')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    // Should find "Product 1", "Product 10", "Product 11", etc.
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/products/:id', () => {
  it('should update a product', async () => {
    // Create a product first
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'To Update',
        price: 50.00,
        categoryId: testCategoryId
      });

    const productId = createRes.body.data.id;

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Name', price: 75.00 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Updated Name');
    expect(parseFloat(updateRes.body.data.price)).toBe(75.00);
  });
});

describe('DELETE /api/products/:id', () => {
  it('should delete a product', async () => {
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'To Delete',
        price: 25.00,
        categoryId: testCategoryId
      });

    const productId = createRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('deleted');
  });
});

describe('DELETE /api/categories/:id (with products)', () => {
  it('should return 409 when deleting a category that has products', async () => {
    // testCategoryId has products from earlier tests
    const res = await request(app)
      .delete(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('Cannot delete');
  });
});
