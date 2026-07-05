// tests/auth.test.js — Authentication endpoint tests
//
// Tests cover:
// 1. Successful registration
// 2. Duplicate email rejection
// 3. Successful login with correct credentials
// 4. Login rejection with wrong password
// 5. Login rejection with non-existent email
// 6. Protected route access without token

const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User } = require('../models');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'TestPass123'
};

beforeAll(async () => {
  // Sync database for tests (creates tables if they don't exist)
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connections after all tests
  await sequelize.close();
});

beforeEach(async () => {
  // Clean the users table before each test for isolation
  await User.destroy({ where: {}, truncate: true, cascade: true });
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully.');
    expect(res.body.user.email).toBe(testUser.email);
    // Password should NOT be in the response
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    // Register first time
    await request(app).post('/api/auth/register').send(testUser);

    // Try to register again with the same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });  // Missing password

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Register a user before login tests
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should login with correct credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3); // JWT has 3 parts
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid');
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Whatever' });

    expect(res.status).toBe(401);
  });
});

describe('Protected routes', () => {
  it('should reject access without a token', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(401);
  });

  it('should reject access with an invalid token', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
  });
});
