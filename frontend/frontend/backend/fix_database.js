const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
  console.log('🔧 Fixing MySQL Database Connection...\n');
  
  try {
    // Step 1: Connect to MySQL without database
    console.log('1. Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });
    console.log('   ✅ Connected to MySQL server\n');

    // Step 2: Check if database exists
    console.log('2. Checking if database exists...');
    const [databases] = await connection.query('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === process.env.DB_NAME);
    
    if (!dbExists) {
      console.log(`   ⚠️  Database '${process.env.DB_NAME}' does not exist`);
      console.log('   Creating database...');
      await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('   ✅ Database created\n');
    } else {
      console.log(`   ✅ Database '${process.env.DB_NAME}' exists\n`);
    }

    // Step 3: Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);
    console.log('3. Checking tables...');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   ✅ Found ${tables.length} tables\n`);
    
    if (tables.length > 0) {
      console.log('   Tables in database:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('   ⚠️  No tables found. Run schema.sql to create tables.');
    }

    await connection.end();
    
    console.log('\n✅ Database connection fixed! You can now fetch tables.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Fix: Check your MySQL username and password in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Fix: Start MySQL service with: net start MySQL80');
    } else {
      console.error('\n💡 Check your MySQL configuration');
    }
    
    process.exit(1);
  }
}

fixDatabase();
