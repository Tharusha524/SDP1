const Order = require('../models/Order');

// Handles order logic
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { userId, products, total, status } = req.body;
  try {
    const orderId = await Order.create({ userId, products, total, status });
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
