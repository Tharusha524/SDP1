const db = require('../config/db');
const { generateOrderId, generateOrderItemId, generatePaymentId } = require('../utils/idGenerator');

const MAX_ORDER_QUANTITY = 50;

const normalizeOrderItems = (body) => {
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const fallbackProductId = body?.productId;
  const fallbackQuantity = Number(body?.quantity);

  const candidateItems = rawItems.length
    ? rawItems
    : (fallbackProductId && Number.isFinite(fallbackQuantity)
      ? [{ productId: fallbackProductId, quantity: fallbackQuantity }]
      : []);

  const mergedByProduct = new Map();

  for (const item of candidateItems) {
    const productId = String(item?.productId || '').trim();
    const quantity = Number(item?.quantity);

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      return { error: 'Each item must include a valid productId and positive quantity' };
    }

    if (quantity > MAX_ORDER_QUANTITY) {
      return { error: `Quantity cannot exceed ${MAX_ORDER_QUANTITY} per item` };
    }

    mergedByProduct.set(productId, (mergedByProduct.get(productId) || 0) + quantity);
  }

  const items = Array.from(mergedByProduct.entries()).map(([productId, quantity]) => ({
    productId,
    quantity
  }));

  return { items };
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
             COALESCE(SUM(oi.Quantity * oi.UnitPriceAtPurchase), 0)   AS TotalPrice,
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
              COALESCE(SUM(oi.Quantity * oi.UnitPriceAtPurchase), 0)   AS TotalPrice,
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
        o.UpdatedAt AS UpdatedAt,
        COALESCE(ns.LastStatusUpdateAt, o.UpdatedAt, o.CreatedAt) AS StatusUpdatedAt,
        o.Status,
        o.Details,
        o.EstimatedCompletionDate,
        COALESCE(oiAgg.TotalPrice, 0) AS TotalPrice,
        COALESCE(oiAgg.TotalQuantity, 0) AS TotalQuantity,
        oiAgg.Items AS Items,
        COALESCE(payAgg.AdvancePaid, 0) AS AdvancePaid
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN (
        SELECT
          oi.OrderID,
          SUM(oi.Quantity * oi.UnitPriceAtPurchase) AS TotalPrice,
          SUM(oi.Quantity) AS TotalQuantity,
          GROUP_CONCAT(CONCAT(p.Name, ' x', oi.Quantity) ORDER BY p.Name SEPARATOR ', ') AS Items
        FROM orderitem oi
        LEFT JOIN product p ON oi.ProductID = p.ProductID
        GROUP BY oi.OrderID
      ) oiAgg ON oiAgg.OrderID = o.OrderID
      LEFT JOIN (
        SELECT
          pay.OrderID,
          SUM(CASE WHEN pay.Status = 'Paid' THEN pay.Amount ELSE 0 END) AS AdvancePaid
        FROM payment pay
        GROUP BY pay.OrderID
      ) payAgg ON payAgg.OrderID = o.OrderID
      LEFT JOIN (
        SELECT
          n.RelatedID AS OrderID,
          n.ReceiverID,
          MAX(n.DateTime) AS LastStatusUpdateAt
        FROM notification n
        WHERE n.Type = 'Order Update'
        GROUP BY n.RelatedID, n.ReceiverID
      ) ns ON ns.OrderID = o.OrderID AND ns.ReceiverID = o.CustomerID
      WHERE o.OrderID = ? AND o.CustomerID = ?`,
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
  let conn;
  try {
    const user = req.user;

    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can place orders' });
    }

    const { details } = req.body || {};
    const normalized = normalizeOrderItems(req.body);

    if (normalized.error) {
      return res.status(400).json({ success: false, error: normalized.error });
    }

    const items = normalized.items;
    if (!items.length) {
      return res.status(400).json({ success: false, error: 'At least one product item is required' });
    }

    const productIds = items.map((item) => item.productId);
    const placeholders = productIds.map(() => '?').join(',');

    const [products] = await db.query(
      `SELECT ProductID, Price FROM product WHERE ProductID IN (${placeholders})`,
      productIds
    );

    if (products.length !== productIds.length) {
      return res.status(404).json({ success: false, error: 'One or more products were not found or inactive' });
    }

    const productPriceById = new Map(
      products.map((product) => [product.ProductID, Number(product.Price)])
    );

    const lineItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: productPriceById.get(item.productId) || 0
    }));

    const totalPrice = lineItems.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity),
      0
    );
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    conn = await db.getConnection();
    await conn.beginTransaction();

    const orderId = await generateOrderId(conn);

    await conn.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Details) VALUES (?, ?, ?, ?)',
      [orderId, user.id, 'Pending', details || '']
    );

    for (const item of lineItems) {
      const orderItemId = await generateOrderItemId(conn);
      await conn.query(
        'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, UnitPriceAtPurchase) VALUES (?, ?, ?, ?, ?)',
        [orderItemId, orderId, item.productId, item.quantity, item.unitPrice]
      );
    }

    const paymentId = await generatePaymentId(conn);
    await conn.query(
      'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, advanceAmount, 'Online', 'Paid']
    );

    await conn.commit();

    return res.status(201).json({ success: true, orderId });
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {
        // ignore rollback errors
      }
    }
    console.error('Error creating order:', err);
    return res.status(500).json({ success: false, error: 'Failed to create order' });
  } finally {
    if (conn) conn.release();
  }
};

