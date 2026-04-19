const db = require('./config/db');

(async () => {
  try {
    const [c1] = await db.query('SHOW COLUMNS FROM inventory_allocation');
    const [c2] = await db.query('SHOW COLUMNS FROM inventory_allocation_item');
    const [[countRow]] = await db.query('SELECT COUNT(*) AS n FROM inventory_allocation_item');

    console.log('inventory_allocation columns:', c1.map(x => x.Field).join(', '));
    console.log('inventory_allocation_item columns:', c2.map(x => x.Field).join(', '));
    console.log('inventory_allocation_item rows:', countRow.n);

    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
