const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== NOTIFICATION TABLE STRUCTURE ===\n');
    const [cols] = await conn.query('DESCRIBE notification');
    cols.forEach(col => {
      console.log(`${col.Field.padEnd(20)} ${col.Type.padEnd(30)} ${col.Key ? '[' + col.Key + ']' : ''} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n=== FOREIGN KEY CONSTRAINTS ===\n');
    const [fks] = await conn.query(`
      SELECT 
        CONSTRAINT_NAME, 
        COLUMN_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'marukawa_concrete_db' 
        AND TABLE_NAME = 'notification' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (fks.length > 0) {
      fks.forEach(fk => {
        console.log(`${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('No foreign key constraints defined.');
    }

    console.log('\n=== SAMPLE DATA (First 5 records) ===\n');
    const [rows] = await conn.query('SELECT * FROM notification LIMIT 5');
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('No data in notification table.');
    }

    console.log('\n=== FUNCTIONAL DEPENDENCY ANALYSIS ===\n');
    
    // Check if ReceiverRole is dependent on ReceiverID
    const [roleCheck] = await conn.query(`
      SELECT 
        ReceiverID, 
        ReceiverRole, 
        COUNT(*) as count 
      FROM notification 
      WHERE ReceiverID IS NOT NULL 
      GROUP BY ReceiverID, ReceiverRole 
      HAVING COUNT(*) > 0
      LIMIT 10
    `);
    
    console.log('ReceiverID -> ReceiverRole dependency check:');
    if (roleCheck.length > 0) {
      console.table(roleCheck);
    } else {
      console.log('No data to analyze.');
    }

    // Check for duplicate ReceiverID with different ReceiverRole
    const [duplicateCheck] = await conn.query(`
      SELECT ReceiverID, COUNT(DISTINCT ReceiverRole) as role_count
      FROM notification
      WHERE ReceiverID IS NOT NULL
      GROUP BY ReceiverID
      HAVING COUNT(DISTINCT ReceiverRole) > 1
    `);
    
    console.log('\nReceiverIDs with multiple ReceiverRoles:');
    if (duplicateCheck.length > 0) {
      console.table(duplicateCheck);
      console.log('⚠️  VIOLATION: Same ReceiverID has different ReceiverRoles - indicates transitive dependency');
    } else {
      console.log('✓ Each ReceiverID consistently maps to one ReceiverRole');
    }

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
