// controllers/product.controller.js — Product CRUD + bulk upload + report endpoints
//
// This controller handles:
// 1. Standard CRUD (list with pagination/sort/search, create, update, delete)
// 2. Bulk upload (accepts file, returns 202, delegates to async processor)
// 3. Bulk upload status polling
// 4. Report generation (streamed CSV/XLSX download)

const path = require('path');
const productService = require('../services/product.service');
const bulkUploadService = require('../services/bulk-upload.service');
const reportService = require('../services/report.service');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * GET /api/products
 * List products with server-side pagination, sorting, and search.
 * Query params: ?page=1&limit=20&sort=price&order=asc&search=keyword
 */
async function getAll(req, res, next) {
  try {
    const result = await productService.getProducts(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
async function getById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Create a new product. The categoryId must reference an existing category.
 */
async function create(req, res, next) {
  try {
    // If an image file was uploaded via multer, use its path
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
    }

    const product = await productService.createProduct(data);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Update an existing product.
 */
async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      data.image = req.body.imageUrl;
    }

    const product = await productService.updateProduct(req.params.id, data);
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product.
 */
async function remove(req, res, next) {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products/bulk-upload
 * Accept a CSV/XLSX file for bulk product import.
 *
 * ★ CRITICAL: This does NOT process the file synchronously.
 * Instead, it:
 * 1. Saves the file to disk (multer)
 * 2. Creates a job record in the database (status: 'processing')
 * 3. Returns 202 Accepted with the jobId IMMEDIATELY
 * 4. Processes the file asynchronously in the background
 *
 * The client polls GET /api/products/bulk-upload/status/:jobId for progress.
 */
async function bulkUpload(req, res, next) {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded. Please provide a CSV or XLSX file.');
    }

    // Validate file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!['.csv', '.xlsx'].includes(ext)) {
      throw new BadRequestError('Invalid file type. Only CSV and XLSX files are accepted.');
    }

    // Start the async processing — returns the jobId immediately
    const jobId = await bulkUploadService.startBulkUpload(req.file.path, ext);

    // 202 Accepted — "I received your request and will process it asynchronously"
    // This is the correct HTTP status for async processing (not 200 or 201)
    res.status(202).json({
      message: 'File accepted for processing.',
      jobId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/bulk-upload/status/:jobId
 * Check the status of an async bulk upload job.
 *
 * Response: { status: 'processing'|'completed'|'failed', processedCount, totalCount, errors: [] }
 */
async function getBulkUploadStatus(req, res, next) {
  try {
    const status = await bulkUploadService.getJobStatus(req.params.jobId);
    res.json(status);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/report?format=csv|xlsx
 * Generate and stream a product report as a downloadable file.
 *
 * ★ CRITICAL: This does NOT build the report in memory.
 * The response is STREAMED — rows are piped from the database cursor
 * directly to the HTTP response. See services/report.service.js for details.
 */
async function generateReport(req, res, next) {
  try {
    const format = (req.query.format || 'csv').toLowerCase();

    if (!['csv', 'xlsx'].includes(format)) {
      throw new BadRequestError('Invalid format. Use ?format=csv or ?format=xlsx');
    }

    if (format === 'csv') {
      await reportService.streamCSVReport(res);
    } else {
      await reportService.streamXLSXReport(res);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  bulkUpload,
  getBulkUploadStatus,
  generateReport
};
