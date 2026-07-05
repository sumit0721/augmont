// routes/product.routes.js — Product CRUD, bulk upload, and report routes
// All routes are PROTECTED by JWT auth middleware.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const productController = require('../controllers/product.controller');

// ─── Multer Configuration ────────────────────────────────────────
// Multer handles multipart/form-data file uploads.
// Files are saved to the /uploads directory with a unique timestamp-based name
// to prevent filename collisions.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Prefix with timestamp to ensure uniqueness
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter: only allow CSV and XLSX for bulk upload, images for product images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.csv', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.jfif'];
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }  // 50MB max file size
});

// Apply JWT auth middleware to ALL product routes
router.use(authMiddleware);

// ─── Report Generation (must be defined BEFORE /:id routes) ──────
// If placed after /:id, Express would try to match "report" as an :id parameter
router.get('/report', productController.generateReport);

// ─── Bulk Upload ─────────────────────────────────────────────────
// POST accepts a single file field named 'file'
router.post('/bulk-upload', upload.single('file'), productController.bulkUpload);
router.get('/bulk-upload/status/:jobId', productController.getBulkUploadStatus);

// ─── Standard CRUD ───────────────────────────────────────────────
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', upload.single('image'), productController.create);
router.put('/:id', upload.single('image'), productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
