// config/database.js — Database connection setup
// Exports two things:
// 1. `sequelize` — the Sequelize ORM instance for all standard CRUD operations
// 2. `rawPool` — a raw pg Pool for streaming queries (report generation)
//
// WHY TWO CONNECTIONS?
// Sequelize loads all query results into memory before returning them.
// For the report endpoint, we need to stream rows directly from the DB cursor
// to the HTTP response without buffering. The raw pg Pool + pg-query-stream
// enables this. See services/report.service.js for the streaming implementation.

const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
require('dotenv').config();

// ─── Sequelize ORM Instance ────────────────────────────────────────
// Used for all standard CRUD: findAll, findOne, create, update, destroy, bulkCreate
const sequelize = new Sequelize(
  process.env.DB_NAME || 'crud_assessment',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,        // Set to console.log to see SQL queries during development
    pool: {
      max: 10,             // Maximum number of connections in pool
      min: 0,
      acquire: 30000,      // Max time (ms) to try getting a connection before throwing error
      idle: 10000           // Max time (ms) a connection can be idle before being released
    }
  }
);

// ─── Raw pg Pool ───────────────────────────────────────────────────
// Used ONLY by report.service.js for streaming cursor queries.
// This bypasses Sequelize entirely to get a raw Node.js readable stream
// from PostgreSQL's DECLARE CURSOR / FETCH protocol.
const rawPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'crud_assessment',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 5                  // Smaller pool — only used for report generation
});

module.exports = { sequelize, rawPool };
