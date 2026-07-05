// models/user.model.js — User model definition
// Stores registered users with bcrypt-hashed passwords.
// The password field stores ONLY the bcrypt hash — plaintext is NEVER stored.

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
      // This stores the bcrypt hash, NOT plaintext.
      // Hashing is done in auth.service.js before calling User.create()
    }
  }, {
    tableName: 'users',
    timestamps: true,
    updatedAt: false   // Schema spec only requires createdAt
  });

  return User;
};
