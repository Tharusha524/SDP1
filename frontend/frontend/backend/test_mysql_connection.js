const mysql = require('mysql2/promise');

(async () => {
  console.log('Testing MySQL Connection...\n');
  
  try {
    // Test 1: Connect to MySQL server (no database)
    console.log('1. Testing MySQL server connection...');
    const serverConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root'
    });
    console.log('✓ MySQL server is accessible\n');
    
    // Test 2: List all databases
    console.log('2. Listing all databases...');
    const [databases] = await serverConn.query('SHOW DATABASES');
    console.log('Available databases:');
    databases.forEach(db => console.log(`  - ${Object.values(db)[0]}`));
    console.log('');
    
    await serverConn.end();
    
    // Test 3: Connect to specific database
    console.log('3. Connecting to marukawa_concrete_db...');
    const dbConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });
    console.log('✓ Connected to marukawa_concrete_db\n');
    
    // Test 4: Fetch tables
    console.log('4. Fetching tables from marukawa_concrete_db...');
    const [tables] = await dbConn.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found in the database');
    } else {
      console.log(`✓ Found ${tables.length} tables:\n`);
      tables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
      });
    }
    
    await dbConn.end();
    
    console.log('\n✅ All tests passed! MySQL is working correctly.');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Code:', error.code);
    console.error('\nPossible fixes:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('  - Check MySQL username and password');
      console.error('  - Run: mysql -u root -p');
      console.error('  - Reset password if needed');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('  - MySQL server is not running');
      console.error('  - Start MySQL service');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('  - Database does not exist');
      console.error('  - Create database: CREATE DATABASE marukawa_concrete_db;');
    } else {
      console.error('  - Check MySQL configuration');
      console.error('  - Check firewall settings');
    }
    
    process.exit(1);
  }
})();
