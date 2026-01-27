const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== ALL RELATIONSHIPS IN ER DIAGRAM ===\n');

    // Get all foreign key relationships
    const [fks] = await conn.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'marukawa_concrete_db'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('FOREIGN KEY RELATIONSHIPS:\n');
    fks.forEach((fk, index) => {
      console.log(`${index + 1}. ${fk.TABLE_NAME} → ${fk.REFERENCED_TABLE_NAME}`);
      console.log(`   (${fk.TABLE_NAME}.${fk.COLUMN_NAME} references ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME})\n`);
    });

    console.log('\n=== RELATIONSHIP SUMMARY ===\n');
    
    // Group by relationship type
    const relationships = {};
    fks.forEach(fk => {
      const key = `${fk.TABLE_NAME} - ${fk.REFERENCED_TABLE_NAME}`;
      if (!relationships[key]) {
        relationships[key] = [];
      }
      relationships[key].push(`${fk.COLUMN_NAME} → ${fk.REFERENCED_COLUMN_NAME}`);
    });

    Object.entries(relationships).forEach(([rel, cols], index) => {
      console.log(`${index + 1}. ${rel}`);
      cols.forEach(col => console.log(`   ${col}`));
      console.log('');
    });

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
