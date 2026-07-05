// models/bulkUploadJob.model.js — Tracks async bulk upload job status
//
// WHY STORE JOB STATUS IN THE DATABASE?
// An in-memory map would be simpler, but job status would be lost if the
// server restarts mid-processing. Storing in the DB ensures:
// 1. Job status survives server restarts
// 2. Multiple server instances (in a scaled deployment) can read the same status
// 3. We have an audit trail of past uploads
//
// The 'errors' field uses JSONB to store an array of per-row validation errors,
// e.g. [{ row: 3, message: "Category 'foo' not found" }]

module.exports = (sequelize, DataTypes) => {
  const BulkUploadJob = sequelize.define('BulkUploadJob', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    status: {
      type: DataTypes.ENUM('processing', 'completed', 'failed'),
      defaultValue: 'processing',
      allowNull: false
    },
    totalCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    processedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    errors: {
      type: DataTypes.JSONB,
      defaultValue: []
      // Array of { row: number, message: string } objects
      // Each entry represents one row that failed validation
    }
  }, {
    tableName: 'bulk_upload_jobs',
    timestamps: true   // Both createdAt and updatedAt are useful for job tracking
  });

  return BulkUploadJob;
};
