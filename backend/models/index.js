// models/index.js — Model loader and association setup
//
// This file:
// 1. Initializes the Sequelize connection (imported from config/database.js)
// 2. Loads all model definition files from this directory
// 3. Calls each model's .associate() method to set up relationships
// 4. Exports the db object containing { sequelize, Sequelize, User, Category, Product, BulkUploadJob }
//
// This is the standard Sequelize model-loading pattern used by sequelize-cli.
// Every controller/service imports models from here instead of connecting directly.

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const db = {};

// ─── Load all model files from this directory ──────────────────────
// Reads every .js file in /models except index.js itself,
// calls each file's exported function with (sequelize, DataTypes),
// and stores the resulting model on the db object.
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&        // Skip hidden files
      file !== 'index.js' &&            // Skip this file
      file.slice(-3) === '.js'          // Only .js files
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// ─── Set up associations ───────────────────────────────────────────
// Each model defines an .associate() method that receives the full db object.
// This two-pass approach (load all models first, then associate) avoids
// circular dependency issues — all models exist before any associations run.
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Attach the sequelize instance and Sequelize class for convenience
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
