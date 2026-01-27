const pool = require('./config/db');

async function checkTables() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Checking existing tables in database...\n');
    
    const [tables] = await connection.query(`
      SHOW TABLES
    `);
    
    console.log('Tables found:');
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    console.log('\n-----------------------------------\n');
    
    // Show structure of each table
    for (let table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\nStructure of ${tableName}:`);
      const [structure] = await connection.query(`DESCRIBE ${tableName}`);
      console.table(structure);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

checkTables();
