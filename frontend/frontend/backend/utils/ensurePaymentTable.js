const db = require('../config/db');

// Ensure the payment table exists with the required columns
const ensurePaymentTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment (
        PaymentID VARCHAR(20) PRIMARY KEY,
        OrderID VARCHAR(20) NOT NULL,
        Amount DECIMAL(10, 2) NOT NULL,
        Method VARCHAR(50) NOT NULL DEFAULT 'Online',
        Status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Paid',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
      )
    `);
    console.log('Payment table ready.');
  } catch (err) {
    console.error('Error ensuring payment table:', err.message);
  }
};

module.exports = ensurePaymentTable;
