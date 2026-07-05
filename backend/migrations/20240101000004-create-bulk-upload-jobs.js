// Migration: Create bulk_upload_jobs table
// Tracks the status of async bulk upload processing.
// The 'errors' column uses JSONB to store an array of per-row validation errors.
// JSONB (not JSON) allows PostgreSQL to index and query the JSON content efficiently.

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the ENUM type for job status
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_bulk_upload_jobs_status" AS ENUM ('processing', 'completed', 'failed');`
    ).catch(() => {
      // ENUM might already exist if migration was partially applied — ignore
    });

    await queryInterface.createTable('bulk_upload_jobs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('processing', 'completed', 'failed'),
        defaultValue: 'processing',
        allowNull: false
      },
      totalCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      processedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      errors: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bulk_upload_jobs');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_bulk_upload_jobs_status";'
    );
  }
};
