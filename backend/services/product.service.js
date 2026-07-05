// services/product.service.js — Product CRUD business logic
//
// Key feature: server-side pagination, sorting, and search.
// The frontend sends query params (?page=1&limit=20&sort=price&order=asc&search=keyword)
// and this service translates them into Sequelize findAndCountAll() options
// with LIMIT/OFFSET, ORDER BY, and WHERE clauses at the DATABASE level.
//
// This is NOT "fetch all then slice" — the database does the filtering,
// which is critical for performance on large datasets.

const { Op } = require('sequelize');
const { Product, Category } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Get products with server-side pagination, sorting, and search.
 *
 * @param {object} queryParams - Express req.query
 * @param {number} queryParams.page - Page number (1-indexed, default 1)
 * @param {number} queryParams.limit - Items per page (default 20, max 100)
 * @param {string} queryParams.sort - Column to sort by (default 'createdAt')
 * @param {string} queryParams.order - Sort direction: 'asc' or 'desc' (default 'desc')
 * @param {string} queryParams.search - Search keyword for product name or category name
 *
 * @returns {Promise<object>} { data, total, page, limit, totalPages }
 */
async function getProducts(queryParams) {
  // Parse and sanitize query parameters with sensible defaults
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const sort = queryParams.sort || 'createdAt';
  const order = (queryParams.order || 'desc').toUpperCase();
  const search = queryParams.search || '';

  const priceMin = queryParams.priceMin ? parseFloat(queryParams.priceMin) : null;
  const priceMax = queryParams.priceMax ? parseFloat(queryParams.priceMax) : null;
  const dateStart = queryParams.dateStart ? new Date(queryParams.dateStart) : null;
  const dateEnd = queryParams.dateEnd ? new Date(queryParams.dateEnd) : null;
  const stockMin = queryParams.stockMin ? parseInt(queryParams.stockMin, 10) : null;
  const categoryId = queryParams.categoryId ? parseInt(queryParams.categoryId, 10) : null;

  const whereClause = {};
  const includeClause = [
    {
      model: Category,
      as: 'category',
      attributes: ['id', 'uniqueId', 'name']
    }
  ];

  if (search) {
    const { sequelize } = require('../models');
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      sequelize.literal(
        `"Product"."categoryId" IN (SELECT id FROM categories WHERE name ILIKE '%${search.replace(/'/g, "''")}%')`
      )
    ];
  }

  // Advanced Filters
  if (priceMin !== null && !isNaN(priceMin)) {
    whereClause.price = { ...whereClause.price, [Op.gte]: priceMin };
  }
  if (priceMax !== null && !isNaN(priceMax)) {
    whereClause.price = { ...whereClause.price, [Op.lte]: priceMax };
  }
  if (stockMin !== null && !isNaN(stockMin)) {
    whereClause.stock = { [Op.gte]: stockMin };
  }
  if (categoryId !== null && !isNaN(categoryId)) {
    whereClause.categoryId = categoryId;
  }
  if (dateStart && !isNaN(dateStart.getTime())) {
    whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: dateStart };
  }
  if (dateEnd && !isNaN(dateEnd.getTime())) {
    whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: dateEnd };
  }

  // ─── Build ORDER clause ────────────────────────────────────────
  const allowedSortColumns = ['price', 'name', 'createdAt', 'id', 'stock'];
  const sortColumn = allowedSortColumns.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

  // ─── Execute query ─────────────────────────────────────────────
  // findAndCountAll returns { rows: [...], count: N }
  // - LIMIT/OFFSET happen at the SQL level (not fetch-all-then-slice)
  // - count is the total matching rows (for pagination controls)
  const { rows, count } = await Product.findAndCountAll({
    where: whereClause,
    include: includeClause,
    order: [[sortColumn, sortOrder]],
    offset: (page - 1) * limit,   // Skip rows for previous pages
    limit: limit,                  // Only fetch this page's rows
    distinct: true                 // Ensure count isn't inflated by JOINs
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  };
}

/**
 * Get a single product by ID, including its category.
 */
async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: 'category' }]
  });

  if (!product) {
    throw new NotFoundError(`Product with id ${id} not found.`);
  }
  return product;
}

/**
 * Create a new product.
 * Validates that the categoryId references an existing category
 * BEFORE attempting the insert — this provides a clear error message
 * instead of a raw foreign key constraint violation.
 */
async function createProduct(data) {
  const { name, price, categoryId, image, stock } = data;

  if (!name || !name.trim()) {
    throw new BadRequestError('Product name is required.');
  }
  if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    throw new BadRequestError('Price must be a positive number.');
  }
  if (!categoryId) {
    throw new BadRequestError('Category ID is required.');
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new BadRequestError(`Category with id ${categoryId} does not exist.`);
  }

  return Product.create({
    name: name.trim(),
    price: parseFloat(price),
    categoryId: parseInt(categoryId, 10),
    image: image || null,
    stock: stock ? parseInt(stock, 10) : 0
  });
}

/**
 * Update an existing product.
 * If categoryId is being changed, validates that the new category exists.
 */
async function updateProduct(id, data) {
  const product = await getProductById(id);

  // If changing category, verify the new one exists
  if (data.categoryId && data.categoryId !== product.categoryId) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw new BadRequestError(`Category with id ${data.categoryId} does not exist.`);
    }
  }

  if (data.name !== undefined) product.name = data.name.trim();
  if (data.price !== undefined) product.price = parseFloat(data.price);
  if (data.categoryId !== undefined) product.categoryId = parseInt(data.categoryId, 10);
  if (data.image !== undefined) product.image = data.image;
  if (data.stock !== undefined) product.stock = parseInt(data.stock, 10);

  await product.save();

  return getProductById(id);
}

/**
 * Delete a product by ID.
 */
async function deleteProduct(id) {
  const product = await getProductById(id);
  const productName = product.name;
  await product.destroy();
  return { message: `Product "${productName}" deleted successfully.` };
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
