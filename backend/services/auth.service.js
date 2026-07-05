// services/auth.service.js — Authentication business logic
//
// Handles:
// 1. Password hashing with bcrypt (registration)
// 2. Password verification with bcrypt (login)
// 3. JWT token generation (login)
// 4. JWT token verification (middleware)
//
// WHY bcrypt?
// bcrypt is a one-way hash that includes a salt (random data mixed into the hash).
// This means even two users with the same password get different hashes,
// and rainbow table attacks are ineffective. The cost factor (10 rounds here)
// makes brute-force attacks computationally expensive.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SALT_ROUNDS = 10;  // Cost factor — 10 rounds is a good balance of security vs. speed
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Hash a plaintext password using bcrypt.
 * Called during registration BEFORE storing the user in the database.
 * The plaintext password is NEVER written to the database.
 *
 * @param {string} plainPassword - The user's plaintext password
 * @returns {Promise<string>} The bcrypt hash
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Called during login to verify the user's identity.
 *
 * @param {string} plainPassword - The password the user submitted
 * @param {string} hashedPassword - The bcrypt hash stored in the database
 * @returns {Promise<boolean>} True if the password matches
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT containing the user's id and email.
 * The token is signed with a secret key and expires after JWT_EXPIRES_IN.
 *
 * @param {object} user - The user object from the database
 * @param {number} user.id - User's database ID
 * @param {string} user.email - User's email
 * @returns {string} Signed JWT string
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token.
 * Throws an error if the token is invalid or expired.
 *
 * @param {string} token - The JWT string to verify
 * @returns {object} Decoded token payload { userId, email, iat, exp }
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};
