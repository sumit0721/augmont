// routes/auth.routes.js — Authentication routes
// These are PUBLIC routes — no JWT middleware applied.

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register — Create a new user account
router.post('/register', register);

// POST /api/auth/login — Authenticate and get a JWT
router.post('/login', login);

module.exports = router;
