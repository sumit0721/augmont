// services/category.service.js — Category CRUD business logic
// Separated from the controller to keep route handlers thin
// and business logic testable independently.

const { Category, Product } = require('../models');
const { NotFoundError, ConflictError, BadRequestError } = require('../utils/errors');

/**
 * Get all categories.
 * @returns {Promise<Array>} List of all categories
 */
async function getAllCategories() {
  return Category.findAll({
    order: [['createdAt', 'DESC']]
  });
}

/**
 * Get a single category by ID.
 * @param {number} id - Category ID
 * @returns {Promise<object>} Category object
 * @throws {NotFoundError} If category doesn't exist
 */
async function getCategoryById(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundError(`Category with id ${id} not found.`);
  }
  return category;
}

/**
 * Create a new category.
 * @param {object} data - { name: string }
 * @returns {Promise<object>} Created category
 */
async function createCategory(data) {
  if (!data.name || !data.name.trim()) {
    throw new BadRequestError('Category name is required.');
  }
  return Category.create({ name: data.name.trim() });
}

/**
 * Update an existing category.
 * @param {number} id - Category ID
 * @param {object} data - { name: string }
 * @returns {Promise<object>} Updated category
 */
async function updateCategory(id, data) {
  const category = await getCategoryById(id);

  if (!data.name || !data.name.trim()) {
    throw new BadRequestError('Category name is required.');
  }

  category.name = data.name.trim();
  await category.save();
  return category;
}

/**
 * Delete a category — but ONLY if no products are attached to it.
 *
 * WHY THE PRE-CHECK?
 * The database has a RESTRICT foreign key constraint, which would throw
 * a raw database error if we tried to delete a category with products.
 * By checking first, we can return a human-readable 409 Conflict error
 * instead of a cryptic database constraint violation.
 *
 * @param {number} id - Category ID
 * @throws {ConflictError} If category has products attached
 * @throws {NotFoundError} If category doesn't exist
 */
async function deleteCategory(id) {
  const category = await getCategoryById(id);

  // Check if any products reference this category
  const productCount = await Product.count({ where: { categoryId: id } });

  if (productCount > 0) {
    throw new ConflictError(
      `Cannot delete category "${category.name}": ${productCount} product(s) are still assigned to it. ` +
      `Reassign or delete those products first.`
    );
  }

  await category.destroy();
  return { message: `Category "${category.name}" deleted successfully.` };
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
