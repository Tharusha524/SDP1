const db = require('./config/db');

(async () => {
  try {
    console.log('Seeding inventory from existing products...');

    // Load some products to attach inventory records to
    const [products] = await db.query('SELECT ProductID, Name FROM product LIMIT 10');
    if (!products.length) {
      console.log('⚠️ No products found in product table. Cannot seed inventory.');
      process.exit(0);
    }

    // Find which products already have inventory
    let existingProductIds = [];
    try {
      const [existing] = await db.query('SELECT ProductID FROM inventory');
      existingProductIds = existing.map(r => r.ProductID);
    } catch (err) {
      console.error('❌ Failed to read from inventory table. Does it exist?', err.message);
      process.exit(1);
    }

    let created = 0;
    for (let index = 0; index < products.length; index++) {
      const p = products[index];
      if (existingProductIds.includes(p.ProductID)) {
        continue; // already has inventory
      }

      const invId = `IN-${String(index + 1).padStart(3, '0')}`;
      const available = 100;      // default starting stock
      const threshold = 20;       // default low-stock threshold

      await db.query(
        'INSERT INTO inventory (InventoryID, ProductID, AvailableQuantity, MinimumThreshold, LastUpdated) VALUES (?, ?, ?, ?, NOW())',
        [invId, p.ProductID, available, threshold]
      );
      console.log(`✓ Created inventory ${invId} for product ${p.ProductID} (${p.Name})`);
      created++;
    }

    if (!created) {
      console.log('Inventory already exists for all listed products. No new rows added.');
    } else {
      console.log(`✅ Seeded ${created} inventory record(s).`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error while seeding inventory:', err.message);
    process.exit(1);
  }
})();
