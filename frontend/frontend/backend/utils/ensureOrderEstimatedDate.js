const db = require('../config/db');

// Ensure orders table has an EstimatedCompletionDate column
const ensureOrderEstimatedDate = async () => {
  try {
    const [rows] = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'EstimatedCompletionDate'"
    );

    if (rows.length === 0) {
      await db.query(
        "ALTER TABLE orders ADD COLUMN EstimatedCompletionDate DATE NULL AFTER Status"
      );
      console.log('Added EstimatedCompletionDate column to orders table.');
    }
  } catch (err) {
    console.error('Error ensuring EstimatedCompletionDate column:', err.message);
  }
};

module.exports = ensureOrderEstimatedDate;
