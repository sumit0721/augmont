// utils/errors.js — Custom error classes
// These provide consistent error handling across all controllers.
// Each error type maps to a specific HTTP status code.

/**
 * Base application error — extends native Error with an HTTP status code.
 * Controllers catch these and use the statusCode to set the response status.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/** 400 — Request body/params are invalid or missing required fields */
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/** 401 — Missing or invalid authentication credentials */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** 404 — The requested resource does not exist */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** 409 — Conflict with current state (e.g., deleting a category with products) */
class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError
};
