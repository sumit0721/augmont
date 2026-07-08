// app.js — Express application setup
//
// This file configures the Express app with:
// 1. Middleware (CORS, JSON parsing, static files)
// 2. Route mounting
// 3. Global error handler
//
// Separated from server.js so the app can be imported by tests
// without starting the HTTP server.

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────

// CORS — allow all origins since we use JWT token-based auth (not cookies)
app.use(cors());

// Parse JSON request bodies (for POST/PUT endpoints)
app.use(express.json());

// Parse URL-encoded form data (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
// e.g., GET /uploads/1234-product.jpg → serves from the uploads/ directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint — useful for deployment monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────────
// This catches all errors passed via next(error) from controllers.
// It maps our custom AppError classes to the correct HTTP status codes.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  // If it's one of our custom AppError types, use its status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Sequelize validation errors (e.g., unique constraint, not-null violation)
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    return res.status(400).json({ error: messages.join(', ') });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      error: 'Cannot complete this operation due to existing references. Check related records.'
    });
  }

  // Multer errors (file too large, wrong type, etc.)
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }

  // Unknown/unexpected errors — don't leak internal details to the client
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
