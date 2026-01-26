// migrate_to_unified_ids.js
// Migrates all role-specific IDs to unified USR-XXXX format
const db = require('./config/db');

async function migrateToUnifiedIds() {
  console.log('🔄 Starting migration to unified ID system...\n');
  
  try {
    // Step 1: Check for foreign key constraints
    console.log('Step 1: Checking foreign key constraints...');
    const [constraints] = await db.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
      AND REFERENCED_TABLE_NAME IN ('Admin', 'Staff', 'Customer', 'Storekeeper')
    `);
    
    console.log('Found constraints:', constraints);
    
    // Step 2: Drop foreign keys temporarily
    console.log('\nStep 2: Dropping foreign key constraints...');
    for (const fk of constraints) {
      try {
        await db.query(`ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`  ✓ Dropped FK: ${fk.CONSTRAINT_NAME} on ${fk.TABLE_NAME}`);
      } catch (e) {
        console.log(`  ⚠ Could not drop ${fk.CONSTRAINT_NAME}: ${e.message}`);
      }
    }

    // Step 3: Migrate Admin table
    console.log('\nStep 3: Migrating Admin table...');
    await db.query('ALTER TABLE Admin MODIFY COLUMN AdminID VARCHAR(20)');
    const [admins] = await db.query('SELECT AdminID, Email FROM Admin ORDER BY AdminID');
    for (let i = 0; i < admins.length; i++) {
      const newId = `USR-${String(i + 1).padStart(4, '0')}`;
      await db.query('UPDATE Admin SET AdminID = ? WHERE AdminID = ?', [newId, admins[i].AdminID]);
      // Update or delete from users table
      await db.query('DELETE FROM users WHERE username = ?', [admins[i].Email]);
      await db.query('INSERT INTO users (id, username, password, role) SELECT ?, Email, Password, "admin" FROM Admin WHERE AdminID = ?', [newId, newId]);
      console.log(`  ✓ ${admins[i].AdminID} → ${newId}`);
    }

    // Step 4: Migrate Staff table
    console.log('\nStep 4: Migrating Staff table...');
    await db.query('ALTER TABLE Staff MODIFY COLUMN StaffID VARCHAR(20)');
    const [staff] = await db.query('SELECT StaffID, Email FROM Staff ORDER BY StaffID');
    let staffCounter = admins.length + 1;
    for (const s of staff) {
      const newId = `USR-${String(staffCounter++).padStart(4, '0')}`;
      
      // Update related tables first
      await db.query('UPDATE Task SET StaffID = ? WHERE StaffID = ?', [newId, s.StaffID]);
      await db.query('UPDATE Staff SET StaffID = ? WHERE StaffID = ?', [newId, s.StaffID]);
      // Update or delete from users table
      await db.query('DELETE FROM users WHERE username = ?', [s.Email]);
      await db.query('INSERT INTO users (id, username, password, role) SELECT ?, Email, Password, "staff" FROM Staff WHERE StaffID = ?', [newId, newId]);
      console.log(`  ✓ ${s.StaffID} → ${newId}`);
    }

    // Step 5: Migrate Customer table
    console.log('\nStep 5: Migrating Customer table...');
    await db.query('ALTER TABLE Customer MODIFY COLUMN CustomerID VARCHAR(20)');
    const [customers] = await db.query('SELECT CustomerID, Email FROM Customer ORDER BY CustomerID');
    let customerCounter = staffCounter;
    for (const c of customers) {
      const newId = `USR-${String(customerCounter++).padStart(4, '0')}`;
      
      // Update related tables
      await db.query('UPDATE Orders SET CustomerID = ? WHERE CustomerID = ?', [newId, c.CustomerID]);
      await db.query('UPDATE Customer SET CustomerID = ? WHERE CustomerID = ?', [newId, c.CustomerID]);
      // Update or delete from users table
      await db.query('DELETE FROM users WHERE username = ?', [c.Email]);
      await db.query('INSERT INTO users (id, username, password, role) SELECT ?, Email, Password, "customer" FROM Customer WHERE CustomerID = ?', [newId, newId]);
      console.log(`  ✓ ${c.CustomerID} → ${newId}`);
    }

    // Step 6: Migrate Storekeeper table
    console.log('\nStep 6: Migrating Storekeeper table...');
    await db.query('ALTER TABLE Storekeeper MODIFY COLUMN StorekeeperID VARCHAR(20)');
    const [storekeepers] = await db.query('SELECT StorekeeperID, Email FROM Storekeeper ORDER BY StorekeeperID');
    let keeperCounter = customerCounter;
    for (const sk of storekeepers) {
      const newId = `USR-${String(keeperCounter++).padStart(4, '0')}`;
      await db.query('UPDATE Storekeeper SET StorekeeperID = ? WHERE StorekeeperID = ?', [newId, sk.StorekeeperID]);
      // Update or delete from users table
      await db.query('DELETE FROM users WHERE username = ?', [sk.Email]);
      await db.query('INSERT INTO users (id, username, password, role) SELECT ?, Email, Password, "storekeeper" FROM Storekeeper WHERE StorekeeperID = ?', [newId, newId]);
      console.log(`  ✓ ${sk.StorekeeperID} → ${newId}`);
    }

    // Step 7: Restore foreign keys with new structure
    console.log('\nStep 7: Restoring foreign key constraints...');
    for (const fk of constraints) {
      try {
        let refTable = fk.REFERENCED_TABLE_NAME;
        let refCol = fk.REFERENCED_COLUMN_NAME;
        
        // Map old column names to new unified format
        if (refCol === 'AdminID') refCol = 'AdminID';
        if (refCol === 'StaffID') refCol = 'StaffID';
        if (refCol === 'CustomerID') refCol = 'CustomerID';
        if (refCol === 'StorekeeperID') refCol = 'StorekeeperID';
        
        await db.query(`
          ALTER TABLE ${fk.TABLE_NAME} 
          ADD CONSTRAINT ${fk.CONSTRAINT_NAME} 
          FOREIGN KEY (${fk.COLUMN_NAME}) REFERENCES ${refTable}(${refCol})
        `);
        console.log(`  ✓ Restored FK: ${fk.CONSTRAINT_NAME}`);
      } catch (e) {
        console.log(`  ⚠ Could not restore ${fk.CONSTRAINT_NAME}: ${e.message}`);
      }
    }

    console.log('\n✅ Migration complete!');
    console.log('\n📊 Summary:');
    console.log(`  Admins: ${admins.length} migrated`);
    console.log(`  Staff: ${staff.length} migrated`);
    console.log(`  Customers: ${customers.length} migrated`);
    console.log(`  Storekeepers: ${storekeepers.length} migrated`);
    console.log('\n  All users now use unified USR-XXXX format! 🎉');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await db.end();
  }
}

migrateToUnifiedIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
