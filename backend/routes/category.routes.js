// routes/category.routes.js — Category CRUD routes
// All routes are PROTECTED — authMiddleware runs before every handler.

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const categoryController = require('../controllers/category.controller');

// Apply JWT auth middleware to ALL category routes
router.use(authMiddleware);

// GET    /api/categories      — List all categories
router.get('/', categoryController.getAll);

// POST   /api/categories      — Create a new category
router.post('/', categoryController.create);

// PUT    /api/categories/:id  — Update a category
router.put('/:id', categoryController.update);

// DELETE /api/categories/:id  — Delete a category (blocked if products exist)
router.delete('/:id', categoryController.remove);

module.exports = router;
