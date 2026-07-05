// models/category.model.js — Category model definition
// Each category has a human-readable name and an auto-generated UUID (uniqueId).
// Categories have a one-to-many relationship with Products.
// Deleting a category that has products is BLOCKED (onDelete: RESTRICT) —
// see the association in models/index.js.

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uniqueId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true
      // Auto-generated — no user input needed
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Category name is required'
        }
      }
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    updatedAt: false   // Schema spec only requires createdAt
  });

  // Associations are defined in models/index.js after all models are loaded
  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });
  };

  return Category;
};
