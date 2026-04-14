// Migration script: rename raw_material_allocation to inventory_allocation
// ensure SummaryText column exists, and drop InventorySummary column.

const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting inventory_allocation migration...');

    // Check if raw_material_allocation table exists
    const [tables] = await db.query(
      "SHOW TABLES LIKE 'raw_material_allocation'"
    );

    if (tables.length > 0) {
      console.log('Found raw_material_allocation table, renaming to inventory_allocation...');
      await db.query(
        'RENAME TABLE raw_material_allocation TO inventory_allocation'
      );
    } else {
      console.log('raw_material_allocation table not found; assuming inventory_allocation already exists.');
    }

    // Ensure SummaryText column exists
    const [summaryColumns] = await db.query(
      "SHOW COLUMNS FROM inventory_allocation LIKE 'SummaryText'"
    );

    if (summaryColumns.length === 0) {
      console.log('Adding SummaryText column to inventory_allocation...');
      await db.query(
        'ALTER TABLE inventory_allocation ADD COLUMN SummaryText VARCHAR(500)'
      );
    } else {
      console.log('SummaryText column already exists on inventory_allocation.');
    }

    // Drop InventorySummary column if present
    const [invSummaryColumns] = await db.query(
      "SHOW COLUMNS FROM inventory_allocation LIKE 'InventorySummary'"
    );

    if (invSummaryColumns.length > 0) {
      console.log('Dropping InventorySummary column from inventory_allocation...');
      await db.query(
        'ALTER TABLE inventory_allocation DROP COLUMN InventorySummary'
      );
    } else {
      console.log('InventorySummary column not found on inventory_allocation; nothing to drop.');
    }

    console.log('inventory_allocation migration completed successfully.');
  } catch (err) {
    console.error('Error during inventory_allocation migration:', err.message);
  } finally {
    await db.end();
  }
}

migrate();
