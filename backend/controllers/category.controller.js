// controllers/category.controller.js — Category CRUD request handlers
// Each handler delegates to category.service.js for business logic
// and passes errors to the global error handler via next(error).

const categoryService = require('../services/category.service');

/** GET /api/categories — List all categories */
async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
}

/** POST /api/categories — Create a new category */
async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
}

/** PUT /api/categories/:id — Update an existing category */
async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/categories/:id — Delete a category (fails if products exist) */
async function remove(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, create, update, remove };
