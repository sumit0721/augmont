// server.js — Application entry point
//
// This file starts the HTTP server and connects to the database.
// Separated from app.js so that:
// 1. Tests can import the Express app without starting the server
// 2. The server startup logic is isolated and easy to understand

const app = require('./app');
const { sequelize } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test the database connection before starting the server
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models with the database (only in development)
    // In production, use migrations: npx sequelize-cli db:migrate
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Models synchronized with database.');
    }

    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📖 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
