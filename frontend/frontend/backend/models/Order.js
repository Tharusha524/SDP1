const db = require('../config/db');
const { generateOrderId, generateOrderItemId } = require('../utils/idGenerator');

const Order = {
  // Create order (3NF compliant - no TotalPrice stored)
  create: async (orderData) => {
    const { customerId, products, status, address, specialInstructions } = orderData;
    const orderId = await generateOrderId(db);
    
    // Insert order without TotalPrice (3NF compliant)
    await db.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Address, SpecialInstructions) VALUES (?, ?, ?, ?, ?)',
      [orderId, customerId, status || 'Pending', address || '', specialInstructions || '']
    );

    // Insert order items with price snapshot
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

  // Get orders by customer with calculated totals (3NF compliant)
  findByCustomerId: async (customerId) => {
    const [rows] = await db.query(`
      SELECT 
        o.OrderID,
        o.CustomerID,
        o.OrderDate,
        o.Status,
        o.Address,
        SUM(oi.Quantity * oi.Price) as TotalPrice,
        GROUP_CONCAT(CONCAT(p.Name, ' (x', oi.Quantity, ')') SEPARATOR ', ') as Items
      FROM orders o
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      WHERE o.CustomerID = ?
      GROUP BY o.OrderID
      ORDER BY o.OrderDate DESC
    `, [customerId]);
    return rows;
  },

  // Get all orders with customer info and calculated totals (3NF compliant)
  findAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        o.OrderID,
        o.CustomerID,
        c.Name as CustomerName,
        c.Email as CustomerEmail,
        c.ContactNo as CustomerContact,
        o.OrderDate,
        o.Status,
        o.Address,
        SUM(oi.Quantity * oi.Price) as TotalPrice,
        SUM(oi.Quantity) as TotalQuantity,
        GROUP_CONCAT(CONCAT(p.Name, ' (x', oi.Quantity, ')') SEPARATOR ', ') as Items
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      GROUP BY o.OrderID
      ORDER BY o.OrderDate DESC
    `);
    return rows;
  },

  // Get single order with full details (3NF compliant)
  findById: async (orderId) => {
    const [orders] = await db.query(`
      SELECT 
        o.OrderID,
        o.CustomerID,
        c.Name as CustomerName,
        c.Email as CustomerEmail,
        o.OrderDate,
        o.Status,
        o.Address,
        o.SpecialInstructions,
        SUM(oi.Quantity * oi.Price) as TotalPrice
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      WHERE o.OrderID = ?
      GROUP BY o.OrderID
    `, [orderId]);

    if (orders.length === 0) return null;

    // Get order items separately
    const [items] = await db.query(`
      SELECT 
        oi.OrderItemID,
        oi.ProductID,
        p.Name as ProductName,
        oi.Quantity,
        oi.Price,
        (oi.Quantity * oi.Price) as Subtotal
      FROM orderitem oi
      LEFT JOIN product p ON oi.ProductID = p.ProductID
      WHERE oi.OrderID = ?
    `, [orderId]);

    return {
      ...orders[0],
      items
    };
  },

  // Update order status
  updateStatus: async (orderId, status) => {
    const [result] = await db.query(
      'UPDATE orders SET Status = ? WHERE OrderID = ?',
      [status, orderId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Order;
