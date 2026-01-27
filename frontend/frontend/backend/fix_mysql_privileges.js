const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== CHECKING PRIVILEGES ===\n');
    
    // Check current user privileges
    const [grants] = await conn.query("SHOW GRANTS FOR 'root'@'localhost'");
    console.log('Current privileges for root@localhost:');
    grants.forEach(grant => {
      console.log(`  ${Object.values(grant)[0]}`);
    });
    
    console.log('\n=== GRANTING FULL PRIVILEGES ===\n');
    
    try {
      await conn.query("GRANT ALL PRIVILEGES ON marukawa_concrete_db.* TO 'root'@'localhost'");
      await conn.query("FLUSH PRIVILEGES");
      console.log('✓ Full privileges granted to root@localhost on marukawa_concrete_db');
    } catch (err) {
      console.log('⚠️  Privileges may already be set:', err.message);
    }
    
    console.log('\n=== CHECKING DATABASE STATUS ===\n');
    
    const [dbStatus] = await conn.query(`
      SELECT 
        table_name,
        table_type,
        engine,
        table_rows,
        data_length,
        index_length
      FROM information_schema.tables
      WHERE table_schema = 'marukawa_concrete_db'
      ORDER BY table_name
    `);
    
    console.log('Database tables status:');
    console.table(dbStatus.map(t => ({
      Table: t.table_name,
      Type: t.table_type,
      Engine: t.engine,
      Rows: t.table_rows
    })));
    
    console.log('\n=== TESTING QUERY EXECUTION ===\n');
    
    // Test query on each table
    const [tables] = await conn.query('SHOW TABLES');
    let successCount = 0;
    let failCount = 0;
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        await conn.query(`SELECT 1 FROM ${tableName} LIMIT 1`);
        successCount++;
      } catch (err) {
        console.log(`❌ Error querying ${tableName}: ${err.message}`);
        failCount++;
      }
    }
    
    console.log(`✓ Successfully queried ${successCount}/${tables.length} tables`);
    
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} table(s) had issues`);
    }
    
    await conn.end();
    
    console.log('\n=== MYSQL WORKBENCH FIX INSTRUCTIONS ===\n');
    console.log('If you are using MySQL Workbench:');
    console.log('1. Close MySQL Workbench completely');
    console.log('2. Delete cache folder:');
    console.log('   C:\\Users\\YourUsername\\AppData\\Roaming\\MySQL\\Workbench\\');
    console.log('3. Restart MySQL Workbench');
    console.log('4. Right-click on connection → Edit Connection');
    console.log('5. Test Connection → OK');
    console.log('6. Right-click on Schemas → Refresh All');
    console.log('\nOR try this query in SQL Editor:');
    console.log('   USE marukawa_concrete_db;');
    console.log('   SHOW TABLES;');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Code:', error.code);
  }
})();
