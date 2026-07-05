require('dotenv').config();
const { Sequelize } = require('sequelize');
const s = new Sequelize(
  process.env.DB_NAME || 'augmont_crud',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  }
);
s.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;')
  .then(() => {
    console.log('success');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
