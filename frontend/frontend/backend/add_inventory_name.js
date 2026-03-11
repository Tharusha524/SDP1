const db = require('./config/db');

setTimeout(async () => {
  try {
    await db.query('ALTER TABLE inventory ADD COLUMN InventoryName VARCHAR(100) AFTER InventoryID');
    console.log('Column InventoryName added');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, skipping ALTER');
    } else {
      throw e;
    }
  }

  await db.query("UPDATE inventory SET InventoryName = 'Cement' WHERE InventoryID = 'IN-001'");
  await db.query("UPDATE inventory SET InventoryName = 'Sand' WHERE InventoryID = 'IN-002'");
  await db.query("UPDATE inventory SET InventoryName = 'Stone Powder' WHERE InventoryID = 'IN-003'");
  console.log('Names updated');

  const [rows] = await db.query('SELECT InventoryID, InventoryName, AvailableQuantity, MinimumThreshold FROM inventory');
  console.table(rows);
  process.exit();
}, 1000);
