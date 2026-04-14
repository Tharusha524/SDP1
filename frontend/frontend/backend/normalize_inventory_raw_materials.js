const db = require('./config/db');

(async () => {
  try {
    console.log('Normalizing inventory to three raw-material rows (cement, sand, stone powder)...');

    // Ensure InventoryName column exists
    try {
      await db.query("ALTER TABLE inventory ADD COLUMN InventoryName VARCHAR(100) AFTER InventoryID");
      console.log('✓ InventoryName column added');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('• InventoryName column already exists');
      } else {
        throw e;
      }
    }

    // Drop foreign key on ProductID (if any) and then drop the column
    try {
      const [cols] = await db.query("SHOW COLUMNS FROM inventory LIKE 'ProductID'");
      if (cols.length) {
        console.log('• ProductID column exists, dropping constraints and column');
        const [constraints] = await db.query(`
          SELECT CONSTRAINT_NAME
          FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'inventory'
            AND COLUMN_NAME = 'ProductID'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        for (const row of constraints) {
          console.log('  - Dropping foreign key', row.CONSTRAINT_NAME);
          await db.query(`ALTER TABLE inventory DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``);
        }
        await db.query('ALTER TABLE inventory DROP COLUMN ProductID');
        console.log('✓ ProductID column dropped');
      } else {
        console.log('• ProductID column not found (already removed)');
      }
    } catch (e) {
      console.error('Error while dropping ProductID (continuing):', e.message);
    }

    // Keep only the three canonical inventory rows
    await db.query("DELETE FROM inventory WHERE InventoryID NOT IN ('IN-001','IN-002','IN-003')");

    // Ensure the three rows exist; insert if missing
    const baseItems = [
      { id: 'IN-001', name: 'Cement', qty: 240, threshold: 50 },
      { id: 'IN-002', name: 'Sand', qty: 24, threshold: 40 },
      { id: 'IN-003', name: 'Stone Powder', qty: 400, threshold: 30 },
    ];

    for (const item of baseItems) {
      const [rows] = await db.query('SELECT InventoryID FROM inventory WHERE InventoryID = ?', [item.id]);
      if (rows.length) {
        await db.query(
          'UPDATE inventory SET InventoryName = ?, AvailableQuantity = ?, MinimumThreshold = ?, LastUpdated = NOW() WHERE InventoryID = ?',
          [item.name, item.qty, item.threshold, item.id]
        );
        console.log(`• Updated existing ${item.id} (${item.name})`);
      } else {
        await db.query(
          'INSERT INTO inventory (InventoryID, InventoryName, AvailableQuantity, MinimumThreshold, LastUpdated) VALUES (?, ?, ?, ?, NOW())',
          [item.id, item.name, item.qty, item.threshold]
        );
        console.log(`✓ Inserted ${item.id} (${item.name})`);
      }
    }

    const [rows] = await db.query('SELECT InventoryID, InventoryName, AvailableQuantity, MinimumThreshold, LastUpdated FROM inventory ORDER BY InventoryID');
    console.table(rows);

    console.log('✅ Inventory normalized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error normalizing inventory:', err.message);
    process.exit(1);
  }
})();
