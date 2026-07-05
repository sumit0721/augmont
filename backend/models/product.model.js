// models/product.model.js — Product model definition
// Each product belongs to exactly one category (required foreign key).
// The price is stored as DECIMAL(10,2) for accurate monetary values.
// The image field stores a URL or file path — not the binary data itself.

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
          msg: 'Product name is required'
        }
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
      // Stores URL or file path — not the binary image data
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Price must be a valid decimal number'
        },
        min: {
          args: [0.01],
          msg: 'Price must be greater than 0'
        }
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'Stock must be an integer' },
        min: { args: [0], msg: 'Stock cannot be negative' }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Foreign key to categories table — enforced at DB level via migration
    }
  }, {
    tableName: 'products',
    timestamps: true,
    updatedAt: false,   // Schema spec only requires createdAt
    indexes: [
      { fields: ['categoryId'] },   // Speed up lookups by category
      { fields: ['name'] },          // Speed up search by name
      { fields: ['price'] }          // Speed up sort by price
    ]
  });

  // Association: each product belongs to one category
  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
      onDelete: 'RESTRICT'   // PREVENT deleting a category that has products
    });
  };

  return Product;
};
