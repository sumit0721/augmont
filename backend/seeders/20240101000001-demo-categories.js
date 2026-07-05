// Seeder: Create demo categories for testing
// These provide initial data so you can immediately create products
// without having to manually create categories first.

'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('categories', [
      { uniqueId: uuidv4(), name: 'Electronics', createdAt: new Date() },
      { uniqueId: uuidv4(), name: 'Clothing', createdAt: new Date() },
      { uniqueId: uuidv4(), name: 'Books', createdAt: new Date() },
      { uniqueId: uuidv4(), name: 'Home & Kitchen', createdAt: new Date() },
      { uniqueId: uuidv4(), name: 'Sports & Outdoors', createdAt: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
