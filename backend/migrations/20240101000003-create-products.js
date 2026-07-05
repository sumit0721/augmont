// Migration: Create products table
// Products have a required foreign key to categories with RESTRICT on delete.
// This means you CANNOT delete a category if any products reference it —
// the database itself will reject the DELETE statement.
// Indexes on categoryId, name, and price speed up the most common queries.

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      uniqueId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        unique: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'   // ← KEY: prevents orphaning products
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // ─── Indexes ─────────────────────────────────────────────────
    // These indexes are critical for the product list endpoint's performance:
    // - categoryId: JOIN and WHERE on category
    // - name: ILIKE search on product name
    // - price: ORDER BY price ASC/DESC sorting
    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['price']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
