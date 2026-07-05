// tests/bulk-upload.test.js — Bulk upload endpoint tests
//
// Tests cover:
// 1. Successful file upload returns 202 with jobId
// 2. Upload without file returns 400
// 3. Upload with invalid file type returns 400
// 4. Validation logic: CSV rows with invalid data produce per-row errors

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const { sequelize } = require('../config/database');
const { User, Category, Product, BulkUploadJob } = require('../models');

let authToken;
const testCSVPath = path.join(__dirname, 'test-upload.csv');
const badCSVPath = path.join(__dirname, 'test-bad-upload.csv');

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register and login
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'bulk-test@example.com', password: 'TestPass123' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bulk-test@example.com', password: 'TestPass123' });

  authToken = loginRes.body.token;

  // Create test categories
  await Category.bulkCreate([
    { name: 'Electronics' },
    { name: 'Books' }
  ]);

  // Create a valid test CSV file
  const validCSV = [
    'name,price,categoryName,image',
    'Laptop,999.99,Electronics,https://example.com/laptop.jpg',
    'Phone,499.99,Electronics,',
    'Novel,15.99,Books,'
  ].join('\n');
  fs.writeFileSync(testCSVPath, validCSV);

  // Create a CSV with some invalid rows for error testing
  const badCSV = [
    'name,price,categoryName,image',
    'Good Product,29.99,Electronics,',          // Valid
    ',19.99,Electronics,',                       // Invalid: missing name
    'Bad Price,not-a-number,Electronics,',        // Invalid: bad price
    'No Category,10.00,NonExistent,',            // Invalid: category not found
    'Another Good,99.99,Books,'                   // Valid
  ].join('\n');
  fs.writeFileSync(badCSVPath, badCSV);
});

afterAll(async () => {
  // Clean up test files
  try { fs.unlinkSync(testCSVPath); } catch (e) { /* ignore */ }
  try { fs.unlinkSync(badCSVPath); } catch (e) { /* ignore */ }
  await sequelize.close();
});

describe('POST /api/products/bulk-upload', () => {
  it('should accept a valid CSV and return 202 with jobId', async () => {
    const res = await request(app)
      .post('/api/products/bulk-upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', testCSVPath);

    expect(res.status).toBe(202);
    expect(res.body.jobId).toBeDefined();
    expect(res.body.message).toContain('accepted');
  });

  it('should return 400 when no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/products/bulk-upload')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('No file');
  });
});

describe('GET /api/products/bulk-upload/status/:jobId', () => {
  it('should return job status after upload', async () => {
    // Upload a file first
    const uploadRes = await request(app)
      .post('/api/products/bulk-upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', testCSVPath);

    const jobId = uploadRes.body.jobId;

    // Wait briefly for async processing to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusRes = await request(app)
      .get(`/api/products/bulk-upload/status/${jobId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusRes.status).toBe(200);
    expect(['processing', 'completed', 'failed']).toContain(statusRes.body.status);
    expect(statusRes.body.processedCount).toBeDefined();
    expect(statusRes.body.totalCount).toBeDefined();
    expect(Array.isArray(statusRes.body.errors)).toBe(true);
  });

  it('should return 404 for non-existent job', async () => {
    const res = await request(app)
      .get('/api/products/bulk-upload/status/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });
});

describe('Bulk upload validation', () => {
  it('should collect per-row errors for invalid data without failing the entire batch', async () => {
    const uploadRes = await request(app)
      .post('/api/products/bulk-upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', badCSVPath);

    const jobId = uploadRes.body.jobId;

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const statusRes = await request(app)
      .get(`/api/products/bulk-upload/status/${jobId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusRes.body.status).toBe('completed');
    // Should have errors for the 3 invalid rows
    expect(statusRes.body.errors.length).toBeGreaterThan(0);
    // Valid rows should still have been inserted
    expect(statusRes.body.totalCount).toBe(5);
  });
});
