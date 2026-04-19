const db = require('./config/db');
const { generateId } = require('./utils/idGenerator');

const parseMaterialsFromSummary = (text) => {
  if (!text) return [];

  const result = [];
  const regex = /(cement|sand|stone\s*powder)\s*([0-9]+(?:\.[0-9]+)?)/gi;
  let match;
  while ((match = regex.exec(String(text))) !== null) {
    const material = match[1].toLowerCase().replace(/\s+/g, ' ').trim();
    const quantity = Number(match[2]);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const normalized = material === 'stone powder' ? 'stone powder' : material;
    result.push({ material: normalized, quantity });
  }

  return result;
};

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_allocation_item (
        AllocationItemID VARCHAR(20) PRIMARY KEY,
        AllocationID VARCHAR(20) NOT NULL,
        InventoryID VARCHAR(20) NOT NULL,
        Quantity DECIMAL(10,2) NOT NULL,
        UNIQUE KEY uq_allocation_inventory (AllocationID, InventoryID),
        FOREIGN KEY (AllocationID) REFERENCES inventory_allocation(AllocationID) ON DELETE CASCADE
      )
    `);

    // If legacy timestamp columns exist, drop them so code can rely on inventory_allocation timestamps
    const [createdCol] = await db.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'CreatedAt'");
    if (createdCol.length > 0) {
      await db.query('ALTER TABLE inventory_allocation_item DROP COLUMN CreatedAt');
    }
    const [updatedCol] = await db.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'UpdatedAt'");
    if (updatedCol.length > 0) {
      await db.query('ALTER TABLE inventory_allocation_item DROP COLUMN UpdatedAt');
    }

    // Remove Unit column if it exists.
    const [unitCols] = await db.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'Unit'");
    if (unitCols.length > 0) {
      await db.query('ALTER TABLE inventory_allocation_item DROP COLUMN Unit');
    }

    // Build inventory id mapping for materials.
    const [inventoryRows] = await db.query('SELECT InventoryID, LOWER(InventoryName) AS InventoryName FROM inventory');
    const materialInventoryMap = {
      cement: (inventoryRows.find(r => String(r.InventoryName).includes('cement')) || {}).InventoryID,
      sand: (inventoryRows.find(r => String(r.InventoryName).includes('sand')) || {}).InventoryID,
      'stone powder': (inventoryRows.find(r => String(r.InventoryName).includes('stone') || String(r.InventoryName).includes('powder')) || {}).InventoryID
    };

    // Read legacy SummaryText values if column still exists and backfill normalized item rows.
    const [summaryCols] = await db.query("SHOW COLUMNS FROM inventory_allocation LIKE 'SummaryText'");
    if (summaryCols.length > 0) {
      const [allocations] = await db.query('SELECT AllocationID, SummaryText FROM inventory_allocation');

      const [idRows] = await db.query('SELECT AllocationItemID FROM inventory_allocation_item ORDER BY AllocationItemID DESC LIMIT 1000');
      const existingIds = idRows.map(r => r.AllocationItemID);

      for (const row of allocations) {
        const materials = parseMaterialsFromSummary(row.SummaryText);
        if (materials.length === 0) continue;

        for (const item of materials) {
          const inventoryId = materialInventoryMap[item.material];
          if (!inventoryId) continue;

          const [[existingItem]] = await db.query(
            'SELECT AllocationItemID FROM inventory_allocation_item WHERE AllocationID = ? AND InventoryID = ? LIMIT 1',
            [row.AllocationID, inventoryId]
          );

          if (existingItem && existingItem.AllocationItemID) {
            const qtyInt = Math.max(0, Math.round(Number(item.quantity) || 0));
            await db.query(
              'UPDATE inventory_allocation_item SET Quantity = ? WHERE AllocationItemID = ?',
              [qtyInt, existingItem.AllocationItemID]
            );
            continue;
          }

          const newId = generateId('RAI', existingIds, 4);
          existingIds.push(newId);

          const qtyInt = Math.max(0, Math.round(Number(item.quantity) || 0));
          await db.query(
            'INSERT INTO inventory_allocation_item (AllocationItemID, AllocationID, InventoryID, Quantity) VALUES (?, ?, ?, ?)',
            [newId, row.AllocationID, inventoryId, qtyInt]
          );
        }
      }

      await db.query('ALTER TABLE inventory_allocation DROP COLUMN SummaryText');
    }

    const [rows] = await db.query("SHOW TABLES LIKE 'inventory_allocation_item'");
    const [summaryCheck] = await db.query("SHOW COLUMNS FROM inventory_allocation LIKE 'SummaryText'");
    const [unitCheck] = await db.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'Unit'");

    if (rows.length > 0 && summaryCheck.length === 0 && unitCheck.length === 0) {
      console.log('inventory_allocation migration complete');
      process.exit(0);
    }

    console.error('inventory_allocation migration did not complete cleanly');
    process.exit(1);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
