const { User, Product, Category } = require('../models');

async function getDashboardStats(req, res, next) {
  try {
    const totalUsers = await User.count();
    const categories = await Category.count();
    const totalProducts = await Product.count();
    const totalStock = await Product.sum('stock') || 0;

    res.json({
      data: {
        totalUsers,
        categories,
        totalProducts,
        totalStock
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats
};
