const db = require('../config/db');
const { generateOrderId, generateOrderItemId } = require('../utils/idGenerator');

const Order = {
  create: async (orderData) => {
    const { customerId, products, total, status, address } = orderData;
    const orderId = await generateOrderId(db);
    
    const [result] = await db.query(
      'INSERT INTO orders (OrderID, CustomerID, TotalPrice, Status, Address) VALUES (?, ?, ?, ?, ?)',
      [orderId, customerId, total, status || 'Pending', address || '']
    );

    // Join products logic (orderitem table)
    for (const item of products) {
      const { productId, quantity, price } = item;
      const orderItemId = await generateOrderItemId(db);
      await db.query(
        'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
        [orderItemId, orderId, productId, quantity, price]
      );
    }
    return orderId;
  },

  findByCustomerId: async (customerId) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE CustomerID = ?', [customerId]);
    return rows;
  },

  findAll: async () => {
    const [rows] = await db.query('SELECT * FROM orders');
    return rows;
  }
};

module.exports = Order;
