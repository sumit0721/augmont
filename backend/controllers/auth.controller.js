// controllers/auth.controller.js — Handles registration and login
//
// Two endpoints:
// POST /api/auth/register — Create a new user with a hashed password
// POST /api/auth/login    — Verify credentials and return a JWT

const { User } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../services/auth.service');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

/**
 * POST /api/auth/register
 * Creates a new user account.
 *
 * Request body: { email: string, password: string }
 * Response: 201 { message, user: { id, email } }
 *
 * Flow:
 * 1. Validate required fields
 * 2. Check if email is already taken
 * 3. Hash the password with bcrypt (NEVER store plaintext)
 * 4. Create the user record
 * 5. Return success (without the password hash)
 */
async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new BadRequestError('Email and password are required.');
    }

    if (password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters.');
    }

    // Check for existing user with this email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('A user with this email already exists.');
    }

    // Hash the password — plaintext is NEVER stored in the database
    const hashedPassword = await hashPassword(password);

    // Create the user record
    const user = await User.create({
      email,
      password: hashedPassword
    });

    // Return success — deliberately exclude the password hash from the response
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 *
 * Request body: { email: string, password: string }
 * Response: 200 { message, token, user: { id, email } }
 *
 * Flow:
 * 1. Find user by email
 * 2. Compare submitted password against stored bcrypt hash
 * 3. Generate a JWT with the user's id and email
 * 4. Return the token
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new BadRequestError('Email and password are required.');
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Use a generic message to avoid revealing whether the email exists
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Compare the submitted password against the stored bcrypt hash
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
