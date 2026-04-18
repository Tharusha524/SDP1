const db = require('../config/db');
const crypto = require('crypto');
const { generateOrderId, generateOrderItemId, generatePaymentId } = require('../utils/idGenerator');

const getEstimatedCompletionDate = (baseDays = 7) => {
  const now = new Date();
  now.setDate(now.getDate() + baseDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// POST /api/payments/payhere-init
// Creates a PayHere sandbox payment session for 40% advance.
// IMPORTANT: This step also creates the order and order item rows immediately
// in MySQL so that the order always exists locally once the customer clicks
// "Pay". The later PayHere return just confirms the payment.
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
      'SELECT ProductID, Name, Price FROM product WHERE ProductID = ? AND IsActive = 1',
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

    // Reserve an OrderID and immediately create the local order + order item
    // so that MySQL always has the order details, even if PayHere cannot call
    // our notify_url (common on localhost setups).
    const orderId = await generateOrderId(db);
    const orderItemId = await generateOrderItemId(db);
    const estimatedCompletionDate = getEstimatedCompletionDate(7);

    await db.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Details, EstimatedCompletionDate) VALUES (?, ?, ?, ?, ?)',
      [orderId, user.id, 'Pending', details || '', estimatedCompletionDate]
    );

    await db.query(
      'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
      [orderItemId, orderId, product.ProductID, quantity, product.Price]
    );

    const tokenPayload = {
      orderId,
      productId: product.ProductID,
      quantity,
      details: details || '',
      customerId: user.id
    };

    const custom1 = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    // Also create a pending payment row now so that even if PayHere cannot
    // reach our notify_url (common on localhost), the payment table already
    // has an entry that we can mark as Paid on return.
    const paymentId = await generatePaymentId(db);

    await db.query(
      'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, advanceAmount, 'PayHere (Sandbox)', 'Pending']
    );

    const amountFormatted = advanceAmount.toFixed(2);
    const currency = 'LKR';

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

    if (!custom_1) {
      // Browser return from PayHere sometimes only sends order_id as a query param.
      // On localhost the notify_url often cannot reach our backend, so we rely on
      // this return to mark the pending payment as Paid.
      if (order_id_from_query) {
        await db.query(
          'UPDATE payment SET Status = ?, Method = ? WHERE OrderID = ?',
          ['Paid', 'PayHere (Sandbox)', order_id_from_query]
        );
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

    const { orderId, productId, quantity, details, customerId } = decoded;

    // PayHere success status is typically "2" in sandbox.
    // If status is provided and is not "2", treat as failure.
    // If status is missing (normalizedStatus === undefined), assume success for browser return.
    if (normalizedStatus !== undefined && normalizedStatus !== '2') {
      return res.redirect(`${frontendBase}/payment-failed`);
    }

    // Re-validate product and compute amounts
    const [products] = await db.query(
      'SELECT ProductID, Price FROM product WHERE ProductID = ? AND IsActive = 1',
      [productId]
    );

    if (products.length === 0) {
      return res.redirect(`${frontendBase}/payment-failed`);
    }

    const product = products[0];
    const totalPrice = Number(product.Price) * quantity;
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    // On return from PayHere, only ensure the payment record exists/updated.
    // Orders and order items were already created during payhereInit.

    const [existingPayments] = await db.query(
      'SELECT PaymentID FROM payment WHERE OrderID = ? LIMIT 1',
      [orderId]
    );

    if (!existingPayments.length) {
      const paymentId = await generatePaymentId(db);

      await db.query(
        'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
        [paymentId, orderId, advanceAmount, 'PayHere (Sandbox)', 'Paid']
      );
    } else {
      // If a payment row already exists for this order, just mark it as paid
      // and update the amount/method to be safe.
      await db.query(
        'UPDATE payment SET Amount = ?, Method = ?, Status = ? WHERE OrderID = ?',
        [advanceAmount, 'PayHere (Sandbox)', 'Paid', orderId]
      );
    }

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

    const [products] = await db.query(
      'SELECT ProductID, Name, Price FROM product WHERE ProductID = ? AND IsActive = 1',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found or inactive' });
    }

    const product = products[0];
    const totalPrice = Number(product.Price) * quantity;
    const advanceAmount = Number((totalPrice * 0.4).toFixed(2));

    const orderId = await generateOrderId(db);
    const orderItemId = await generateOrderItemId(db);
    const paymentId = await generatePaymentId(db);
    const estimatedCompletionDate = getEstimatedCompletionDate(7);

    await db.query(
      'INSERT INTO orders (OrderID, CustomerID, Status, Details, EstimatedCompletionDate) VALUES (?, ?, ?, ?, ?)',
      [orderId, user.id, 'Pending', details || '', estimatedCompletionDate]
    );

    await db.query(
      'INSERT INTO orderitem (OrderItemID, OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
      [orderItemId, orderId, product.ProductID, quantity, product.Price]
    );

    await db.query(
      'INSERT INTO payment (PaymentID, OrderID, Amount, Method, Status) VALUES (?, ?, ?, ?, ?)',
      [paymentId, orderId, advanceAmount, 'Card (Demo)', 'Paid']
    );

    return res.json({
      success: true,
      orderId,
      totalPrice,
      advanceAmount,
      estimatedCompletionDate
    });
  } catch (err) {
    console.error('Payment error:', err.message);
    return res.status(500).json({ success: false, error: err.message || 'Failed to complete payment' });
  }
};
