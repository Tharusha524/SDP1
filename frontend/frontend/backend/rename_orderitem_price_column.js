const mysql = require('mysql2/promise');
require('dotenv').config();

async function renameOrderitemPriceColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Connected to MySQL. Checking orderitem columns...');

    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orderitem'
    `, [process.env.DB_NAME]);

    const columnNames = columns.map((c) => c.COLUMN_NAME);
    const hasOld = columnNames.includes('Price');
    const hasNew = columnNames.includes('UnitPriceAtPurchase');

    if (!hasOld && hasNew) {
      console.log('No change needed. Column already renamed to UnitPriceAtPurchase.');
      return;
    }

    if (!hasOld && !hasNew) {
      throw new Error('Neither Price nor UnitPriceAtPurchase was found in orderitem.');
    }

    if (hasOld && hasNew) {
      throw new Error('Both Price and UnitPriceAtPurchase exist. Resolve manually to avoid data ambiguity.');
    }

    await connection.query(
      'ALTER TABLE orderitem CHANGE COLUMN Price UnitPriceAtPurchase DECIMAL(10,2) NOT NULL'
    );

    console.log('Rename complete: orderitem.Price -> orderitem.UnitPriceAtPurchase');
  } finally {
    await connection.end();
  }
}

renameOrderitemPriceColumn()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Rename failed:', err.message);
    process.exit(1);
  });
