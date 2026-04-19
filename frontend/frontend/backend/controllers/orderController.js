const db = require('../config/db');
const { generateOrderId, generateOrderItemId, generatePaymentId } = require('../utils/idGenerator');

const getEstimatedCompletionDate = (baseDays = 7) => {
  const now = new Date();
  now.setDate(now.getDate() + baseDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// GET /api/orders — all orders with customer name, items, totals (admin/staff)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
            SELECT o.OrderID,
              COALESCE(c.Name, o.CustomerID) AS CustomerName,
              o.CreatedAt AS OrderDate,
              o.Status,
              o.Details,
              o.EstimatedCompletionDate,
             COALESCE(SUM(oi.Quantity * oi.Price), 0)   AS TotalPrice,
             COALESCE(SUM(oi.Quantity), 0)               AS TotalQuantity,
             GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
      FROM orders o
      LEFT JOIN customer c  ON o.CustomerID  = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID    = oi.OrderID
      LEFT JOIN product p   ON oi.ProductID  = p.ProductID
      GROUP BY o.OrderID, c.Name, o.CustomerID, o.CreatedAt, o.Status, o.Details, o.EstimatedCompletionDate
      ORDER BY o.CreatedAt DESC
    `);
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/orders/my — all orders for the logged-in customer
exports.getMyOrders = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can view their orders' });
    }

    const [orders] = await db.query(
            `SELECT o.OrderID,
              COALESCE(c.Name, o.CustomerID) AS CustomerName,
              o.CreatedAt AS OrderDate,
              o.Status,
              o.EstimatedCompletionDate,
              COALESCE(SUM(oi.Quantity * oi.Price), 0)   AS TotalPrice,
              COALESCE(SUM(oi.Quantity), 0)               AS TotalQuantity,
              GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
       FROM orders o
       LEFT JOIN customer c  ON o.CustomerID  = c.CustomerID
       LEFT JOIN orderitem oi ON o.OrderID    = oi.OrderID
       LEFT JOIN product p   ON oi.ProductID  = p.ProductID
       WHERE o.CustomerID = ?
      GROUP BY o.OrderID, c.Name, o.CustomerID, o.CreatedAt, o.Status, o.EstimatedCompletionDate
       ORDER BY o.CreatedAt DESC`,
      [user.id]
    );

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
};

// GET /api/orders/:orderId — detailed order summary for the logged-in customer
exports.getOrderById = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can view order details' });
    }

    const { orderId } = req.params;

    const [rows] = await db.query(
            `SELECT o.OrderID,
              o.CustomerID,
              COALESCE(c.Name, o.CustomerID) AS CustomerName,
              o.CreatedAt AS OrderDate,
              o.Status,
              o.Details,
              o.EstimatedCompletionDate,
              COALESCE(SUM(oi.Quantity * oi.Price), 0) AS TotalPrice,
              COALESCE(SUM(oi.Quantity), 0)           AS TotalQuantity,
              GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items,
              COALESCE(SUM(CASE WHEN pay.Status = 'Paid' THEN pay.Amount ELSE 0 END), 0) AS AdvancePaid
       FROM orders o
       LEFT JOIN customer c   ON o.CustomerID  = c.CustomerID
       LEFT JOIN orderitem oi ON o.OrderID     = oi.OrderID
       LEFT JOIN product p    ON oi.ProductID  = p.ProductID
       LEFT JOIN payment pay  ON pay.OrderID   = o.OrderID
       WHERE o.OrderID = ? AND o.CustomerID = ?
      GROUP BY o.OrderID, o.CustomerID, c.Name, o.CreatedAt, o.Status, o.Details, o.EstimatedCompletionDate`,
      [orderId, user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    return res.json({ success: true, order: rows[0] });
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch order details' });
  }
};

// POST /api/orders — create a new order for the logged-in customer
exports.createOrder = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can place orders' });
    }

    const { productId, quantity, details } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Product and positive quantity are required' });
    }
        
      const MAX_ORDER_QUANTITY = 50;
        
      if (quantity > MAX_ORDER_QUANTITY) {
        return res.status(400).json({
          success: false,
          error: `Quantity cannot exceed ${MAX_ORDER_QUANTITY} per order`
        });
      }

    // Get current product price snapshot
    const [products] = await db.query(
      'SELECT ProductID, Price FROM product WHERE ProductID = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found or inactive' });
    }

    const product = products[0];

    const totalPrice = Number(product.Price) * quantity;
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    // Generate IDs
    const orderId = await generateOrderId(db);
    const orderItemId = await generateOrderItemId(db);

    const estimatedCompletionDate = getEstimatedCompletionDate(7);

    // Insert into orders table (3NF schema: Details instead of Address/SpecialInstructions)
    await db.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Details, EstimatedCompletionDate) VALUES (?, ?, ?, ?, ?)',
      [orderId, user.id, 'Pending', details || '', estimatedCompletionDate]
    );

    // Insert into orderitem table with price snapshot
    await db.query(
      'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
      [orderItemId, orderId, product.ProductID, quantity, product.Price]
    );

    // Record the 40% advance payment in payment table
    const paymentId = await generatePaymentId(db);
    await db.query(
      'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, advanceAmount, 'Online', 'Paid']
    );

    return res.status(201).json({ success: true, orderId });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

