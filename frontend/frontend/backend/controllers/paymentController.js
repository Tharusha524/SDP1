const db = require('../config/db');
const crypto = require('crypto');
const { generateOrderId, generateOrderItemId, generatePaymentId } = require('../utils/idGenerator');

const MAX_ORDER_QUANTITY = 50;

const ensurePayherePendingTable = async (queryable) => {
  // queryable can be the pool or a transaction connection
  await queryable.query(`
    CREATE TABLE IF NOT EXISTS payhere_pending (
      OrderID VARCHAR(50) PRIMARY KEY,
      CustomerID VARCHAR(50) NOT NULL,
      ProductID VARCHAR(50) NOT NULL,
      Quantity INT NOT NULL,
      Details TEXT,
      UnitPriceAtPurchase DECIMAL(10,2) NOT NULL,
      AdvanceAmount DECIMAL(10,2) NOT NULL,
      Currency VARCHAR(10) NOT NULL DEFAULT 'LKR',
      Paid TINYINT(1) NOT NULL DEFAULT 0,
      PayHereStatus VARCHAR(20) NULL,
      CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PaidAt TIMESTAMP NULL,
      FinalizedAt TIMESTAMP NULL,
      KEY idx_customer (CustomerID),
      KEY idx_paid (Paid)
    )
  `);
};

// POST /api/payments/payhere-init
// Creates a PayHere sandbox payment session for 40% advance.
// IMPORTANT: This step MUST NOT create the order/orderitem/payment rows.
// We only store a pending payment session so the order can be created later
// when the customer returns to the payment-success UI.
exports.payhereInit = async (req, res) => {
  try {
    const user = req.user;

    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can place orders' });
    }

    const { productId, quantity, details } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Product and positive quantity are required' });
    }

    const [products] = await db.query(
      'SELECT ProductID, Name, Price FROM product WHERE ProductID = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found or inactive' });
    }

    const product = products[0];

    const totalPrice = Number(product.Price) * quantity;
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    // Fetch customer details for PayHere form
    const [customers] = await db.query(
      'SELECT Name, Email, ContactNo, Address FROM customer WHERE CustomerID = ?',
      [user.id]
    );

    const customer = customers[0] || {};
    const nameParts = (customer.Name || '').split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'Marukawa';

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || merchantId === 'YOUR_SANDBOX_MERCHANT_ID' || merchantId === 'YOUR_MERCHANT_ID') {
      return res.status(500).json({
        success: false,
        error: 'PayHere sandbox merchant ID is not configured. Please set PAYHERE_MERCHANT_ID in backend .env.'
      });
    }

    if (!merchantSecret || merchantSecret === 'YOUR_MERCHANT_SECRET') {
      return res.status(500).json({
        success: false,
        error: 'PayHere merchant secret is not configured. Please set PAYHERE_MERCHANT_SECRET in backend .env (from the Integrations screen).' ,
      });
    }

    const payhereUrl = process.env.PAYHERE_SANDBOX_URL || 'https://sandbox.payhere.lk/pay/checkout';
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';

    // Reserve an OrderID but DO NOT create order/payment rows yet.
    const orderId = await generateOrderId(db);

    const tokenPayload = {
      orderId,
      productId: product.ProductID,
      quantity,
      details: details || '',
      customerId: user.id
    };

    const custom1 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    const amountFormatted = advanceAmount.toFixed(2);
    const currency = 'LKR';

    // Store pending session in DB (used later by /api/payments/finalize)
    await ensurePayherePendingTable(db);
    await db.query(
      `INSERT INTO payhere_pending
        (OrderID, CustomerID, ProductID, Quantity, Details, UnitPriceAtPurchase, AdvanceAmount, Currency, Paid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         CustomerID = VALUES(CustomerID),
         ProductID = VALUES(ProductID),
         Quantity = VALUES(Quantity),
         Details = VALUES(Details),
         UnitPriceAtPurchase = VALUES(UnitPriceAtPurchase),
         AdvanceAmount = VALUES(AdvanceAmount),
         Currency = VALUES(Currency),
         Paid = 0,
         PayHereStatus = NULL,
         PaidAt = NULL,
         FinalizedAt = NULL`,
      [
        orderId,
        user.id,
        product.ProductID,
        quantity,
        details || '',
        product.Price,
        amountFormatted,
        currency
      ]
    );

    // PayHere hash: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase())
    const merchantSecretHash = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hash = crypto
      .createHash('md5')
      .update(merchantId + orderId + amountFormatted + currency + merchantSecretHash)
      .digest('hex')
      .toUpperCase();

    const params = {
      merchant_id: merchantId,
      return_url: `${backendBase}/api/payments/payhere-return`,
      cancel_url: `${frontendBase}/customer/place-order`,
      // Use the same endpoint for PayHere's server-to-server notification.
      // This POST call will include full details (including custom_1) so we can
      // safely write the order and payment records before the browser redirect.
      notify_url: `${backendBase}/api/payments/payhere-return`,
      order_id: orderId,
      items: product.Name,
      amount: amountFormatted,
      currency,
      hash,
      first_name: firstName,
      last_name: lastName,
      email: customer.Email || user.username || 'customer@example.com',
      phone: customer.ContactNo || '0770000000',
      address: customer.Address || 'Address not provided',
      city: 'Colombo',
      country: 'Sri Lanka',
      custom_1: custom1
    };

    return res.json({ success: true, payhereUrl, params });
  } catch (err) {
    console.error('Error creating PayHere session:', err);
    return res.status(500).json({ success: false, error: 'Failed to start payment session' });
  }
};

// POST /api/payments/payhere-return
// PayHere return URL (browser is redirected here after sandbox payment)
exports.payhereReturn = async (req, res) => {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    // PayHere may send data via POST body (notify_url) or GET query (return_url)
    const source = Object.keys(req.body || {}).length ? req.body : req.query || {};

    const custom_1 = source.custom_1;
    const order_id_from_query = source.order_id || source.orderId;
    // Some integrations send status as status_code, some as status; normalize and trim
    const rawStatus = source.status_code || source.status || source.statusCode;
    const normalizedStatus = rawStatus != null ? String(rawStatus).trim() : undefined;

    // If status is provided and is not success, treat as failure.
    if (normalizedStatus !== undefined && normalizedStatus !== '2') {
      return res.redirect(`${frontendBase}/payment-failed`);
    }

    // Mark pending session as paid (if we have an order id)
    const markPaidIfPossible = async (oid) => {
      if (!oid) return;
      try {
        await ensurePayherePendingTable(db);
        await db.query(
          'UPDATE payhere_pending SET Paid = 1, PayHereStatus = ?, PaidAt = NOW() WHERE OrderID = ?',
          [normalizedStatus || '2', oid]
        );
      } catch (e) {
        console.error('Failed to mark payhere_pending as paid:', e);
      }
    };

    await markPaidIfPossible(order_id_from_query);

    // If PayHere didn't send custom_1 (common in browser return), just redirect
    // using order_id. The frontend success page will finalize the DB insert.
    if (!custom_1) {
      if (order_id_from_query) {
        return res.redirect(`${frontendBase}/payment-success?orderId=${encodeURIComponent(order_id_from_query)}`);
      }
      return res.redirect(`${frontendBase}/payment-failed`);
    }

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(custom_1, 'base64').toString('utf8'));
    } catch (e) {
      console.error('Failed to decode custom_1 token:', e.message);
      return res.redirect(`${frontendBase}/payment-failed`);
    }

    const { orderId } = decoded;

    // Mark paid using decoded orderId as well (some callbacks may omit order_id)
    await markPaidIfPossible(orderId);

    // Success: redirect to the frontend success UI. That UI will call /finalize
    // to create the order/payment rows in the database.
    return res.redirect(`${frontendBase}/payment-success?orderId=${encodeURIComponent(orderId)}`);
  } catch (err) {
    console.error('Error handling PayHere return:', err);
    return res.redirect(`${frontendBase}/payment-failed`);
  }
};

// POST /api/payments/card-direct
// Demo card payment flow that does NOT call PayHere.
// Creates the order, order item, and a PAID payment row directly in MySQL
// and returns the new orderId to the frontend.
exports.cardDirectPayment = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'customer') {
      return res.status(403).json({ success: false, error: 'Only customers can place orders' });
    }

    const { productId, quantity, details } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Product and positive quantity are required' });
    }

    if (quantity > MAX_ORDER_QUANTITY) {
      return res.status(400).json({
        success: false,
        error: `Quantity cannot exceed ${MAX_ORDER_QUANTITY} per order`
      });
    }

    // Check product exists and is active
    const [products] = await db.query(
      'SELECT `ProductID`, `Name`, `Price` FROM `product` WHERE `ProductID` = ?',
      [productId]
    );

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, error: 'Product with ID ' + productId + ' not found or inactive' });
    }

    const product = products[0];
    const totalPrice = Number(product.Price) * quantity;
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    const orderId = await generateOrderId(db);
    const orderItemId = await generateOrderItemId(db);
    const paymentId = await generatePaymentId(db);

    // Create order (do not set EstimatedCompletionDate here; staff/admin may update later)
    await db.query(
      'INSERT INTO `orders` (`OrderID`, `CustomerID`, `Status`, `Details`) VALUES (?, ?, ?, ?)',
      [orderId, user.id, 'Pending', details || '']
    );

    // Create order item
    await db.query(
      'INSERT INTO `orderitem` (`OrderItemID`, `OrderID`, `ProductID`, `Quantity`, `UnitPriceAtPurchase`) VALUES (?, ?, ?, ?, ?)',
      [orderItemId, orderId, product.ProductID, quantity, product.Price]
    );

    // Record payment
    await db.query(
      'INSERT INTO `payment` (`PaymentID`, `OrderID`, `Amount`, `Method`, `Status`) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, advanceAmount, 'online', 'Paid']
    );

    return res.json({
      success: true,
      orderId,
      totalPrice,
      advanceAmount
    });
  } catch (err) {
    console.error('Payment error:', err.message, err.sql);
    return res.status(500).json({ success: false, error: err.message || 'Failed to complete payment' });
  }
};

// POST /api/payments/finalize
// Called by the frontend payment-success UI to create order/orderitem/payment
// after the customer returns from PayHere and the payment is successful.
exports.finalizeOrder = async (req, res) => {
  const user = req.user;
  if (!user || user.role !== 'customer') {
    return res.status(403).json({ success: false, error: 'Only customers can finalize orders' });
  }

  const orderId = req.body?.orderId;
  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await ensurePayherePendingTable(conn);

    // If order already exists, return success (idempotent)
    const [existingOrders] = await conn.query('SELECT OrderID FROM orders WHERE OrderID = ? LIMIT 1', [orderId]);
    if (existingOrders.length) {
      await conn.commit();
      return res.json({ success: true, orderId });
    }

    // Load pending session (must belong to this customer)
    const [pendingRows] = await conn.query(
      'SELECT * FROM payhere_pending WHERE OrderID = ? AND CustomerID = ? LIMIT 1',
      [orderId, user.id]
    );

    if (!pendingRows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Pending payment session not found' });
    }

    const pending = pendingRows[0];
    if (!pending.Paid) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: 'Payment not confirmed yet' });
    }

    // Ensure product still exists
    const [products] = await conn.query('SELECT ProductID FROM product WHERE ProductID = ? LIMIT 1', [pending.ProductID]);
    if (!products.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const orderItemId = await generateOrderItemId(conn);
    const paymentId = await generatePaymentId(conn);

    await conn.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Details) VALUES (?, ?, ?, ?)',
      [orderId, user.id, 'Pending', pending.Details || '']
    );

    await conn.query(
      'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, UnitPriceAtPurchase) VALUES (?, ?, ?, ?, ?)',
      [orderItemId, orderId, pending.ProductID, pending.Quantity, pending.UnitPriceAtPurchase]
    );

    await conn.query(
      'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, pending.AdvanceAmount, 'online', 'Paid']
    );

    await conn.query('UPDATE payhere_pending SET FinalizedAt = NOW() WHERE OrderID = ?', [orderId]);

    await conn.commit();
    return res.json({ success: true, orderId });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      // ignore
    }
    console.error('Finalize order error:', err);
    return res.status(500).json({ success: false, error: 'Failed to finalize order' });
  } finally {
    conn.release();
  }
};
