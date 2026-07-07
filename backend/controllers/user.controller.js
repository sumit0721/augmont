// controllers/user.controller.js — User CRUD
const { User } = require('../models');
const { hashPassword } = require('../services/auth.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');

async function getAllUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'createdAt'] // exclude password
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'createdAt']
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }
    
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestError('User already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ email, password: hashedPassword });
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (email) user.email = email;
    if (password) {
      user.password = await hashPassword(password);
    }
    
    await user.save();
    
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
