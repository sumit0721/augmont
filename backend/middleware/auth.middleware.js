// middleware/auth.middleware.js — JWT verification middleware
//
// This middleware runs BEFORE any protected route handler.
// It extracts the JWT from the Authorization header, verifies it,
// and attaches the decoded user data to req.user.
//
// If the token is missing, invalid, or expired, the request is rejected
// with a 401 Unauthorized response BEFORE reaching the controller.

const { verifyToken } = require('../services/auth.service');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Express middleware that protects routes by requiring a valid JWT.
 *
 * Expected header format: Authorization: Bearer <token>
 *
 * On success: attaches { userId, email } to req.user and calls next()
 * On failure: returns 401 with an error message
 */
function authMiddleware(req, res, next) {
  try {
    // 1. Extract the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    // 2. Extract the token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Access denied. Token is empty.');
    }

    // 3. Verify the token and decode the payload
    // jwt.verify() throws if the token is expired, tampered with, or invalid
    const decoded = verifyToken(token);

    // 4. Attach user data to the request for downstream controllers
    req.user = decoded;

    // 5. Proceed to the next middleware/controller
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    // Handle our custom UnauthorizedError
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    // Unexpected error
    return res.status(401).json({ error: 'Authentication failed.' });
  }
}

module.exports = authMiddleware;
