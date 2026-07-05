'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fetch all categories
    const categories = await queryInterface.sequelize.query(
      `SELECT id, name from "categories";`
    );

    const categoryRows = categories[0];

    if (categoryRows.length === 0) {
      console.log('No categories found. Run category seeder first.');
      return;
    }

    const products = [];

    // 2. Create 25 products per category
    for (const category of categoryRows) {
      for (let i = 1; i <= 25; i++) {
        products.push({
          uniqueId: uuidv4(),
          categoryId: category.id,
          name: `${category.name} Item ${i}`,
          price: Math.floor(Math.random() * 500) + 10,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // 3. Bulk insert the products
    await queryInterface.bulkInsert('products', products);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
