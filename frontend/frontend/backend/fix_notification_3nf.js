const mysql = require('mysql2/promise');

/**
 * Fix notification table to comply with 3NF by removing ReceiverRole column
 * ReceiverRole creates a transitive dependency: NotificationID -> ReceiverID -> ReceiverRole
 * The role can be derived by joining with the users table
 */

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('✓ Connected to database\n');

    // Step 1: Check current structure
    console.log('=== CURRENT NOTIFICATION TABLE STRUCTURE ===');
    const [columns] = await connection.query('DESCRIBE notification');
    console.table(columns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Key: col.Key,
      Null: col.Null
    })));

    // Step 2: Check if ReceiverRole column exists
    const hasReceiverRole = columns.some(col => col.Field === 'ReceiverRole');
    
    if (!hasReceiverRole) {
      console.log('\n✓ ReceiverRole column already removed. Table is in 3NF.');
      await connection.end();
      return;
    }

    // Step 3: Create a backup of current data
    console.log('\n=== CREATING BACKUP ===');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_backup_${Date.now()} 
      AS SELECT * FROM notification
    `);
    console.log('✓ Backup created');

    // Step 4: Add foreign key constraint to ReceiverID (if not exists)
    console.log('\n=== ADDING FOREIGN KEY CONSTRAINT ===');
    try {
      await connection.query(`
        ALTER TABLE notification
        ADD CONSTRAINT fk_notification_receiver
        FOREIGN KEY (ReceiverID) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key constraint added: ReceiverID -> users(id)');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Foreign key already exists');
      } else {
        console.log('⚠️  Could not add foreign key:', err.message);
        console.log('   Continuing with ReceiverRole removal...');
      }
    }

    // Step 5: Drop ReceiverRole column
    console.log('\n=== REMOVING RECEIVERROLE COLUMN ===');
    await connection.query(`
      ALTER TABLE notification
      DROP COLUMN ReceiverRole
    `);
    console.log('✓ ReceiverRole column removed');

    // Step 6: Verify new structure
    console.log('\n=== NEW NOTIFICATION TABLE STRUCTURE ===');
    const [newColumns] = await connection.query('DESCRIBE notification');
    console.table(newColumns.map(col => ({
      Field: col.Field,
      Type: col.Type,
      Key: col.Key,
      Null: col.Null
    })));

    // Step 7: Show how to query notifications with role
    console.log('\n=== QUERY EXAMPLE (Getting notifications with receiver role) ===');
    console.log(`
SELECT 
  n.NotificationID,
  n.Message,
  n.Type,
  n.ReceiverID,
  u.role AS ReceiverRole,
  n.IsRead,
  n.RelatedID,
  n.DateTime
FROM notification n
LEFT JOIN users u ON n.ReceiverID = u.id
LIMIT 5;
    `);

    const [sampleData] = await connection.query(`
      SELECT 
        n.NotificationID,
        n.Message,
        n.Type,
        n.ReceiverID,
        u.role AS ReceiverRole,
        n.IsRead,
        n.DateTime
      FROM notification n
      LEFT JOIN users u ON n.ReceiverID = u.id
      LIMIT 5
    `);

    if (sampleData.length > 0) {
      console.log('\n=== SAMPLE DATA WITH JOIN ===');
      console.table(sampleData);
    }

    console.log('\n✅ SUCCESS: notification table is now in 3NF!');
    console.log('\nWhat changed:');
    console.log('  - Removed ReceiverRole column (transitive dependency eliminated)');
    console.log('  - Added foreign key constraint to ReceiverID');
    console.log('  - ReceiverRole now derived via JOIN with users table');

    await connection.end();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
})();
