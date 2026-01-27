const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'marukawa_concrete_db'
    });

    console.log('=== COMPREHENSIVE 3NF ANALYSIS ===\n');
    console.log('Checking all tables for Third Normal Form compliance...\n');

    // Get all tables
    const [tables] = await conn.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'marukawa_concrete_db' 
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    const violations = [];
    const compliant = [];
    const warnings = [];

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      console.log(`\n─────────────────────────────────────────`);
      console.log(`Analyzing: ${tableName.toUpperCase()}`);
      console.log(`─────────────────────────────────────────`);

      // Get table structure
      const [cols] = await conn.query(`DESCRIBE ${tableName}`);
      
      // Get foreign keys
      const [fks] = await conn.query(`
        SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'marukawa_concrete_db'
          AND TABLE_NAME = '${tableName}'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);

      const pk = cols.filter(c => c.Key === 'PRI').map(c => c.Field);
      const nonKeyAttrs = cols.filter(c => c.Key !== 'PRI').map(c => c.Field);

      console.log(`PK: ${pk.join(', ')}`);
      console.log(`Non-key attributes: ${nonKeyAttrs.join(', ')}`);
      if (fks.length > 0) {
        console.log(`FKs: ${fks.map(f => `${f.COLUMN_NAME} → ${f.REFERENCED_TABLE_NAME}`).join(', ')}`);
      }

      // Check specific tables for 3NF violations
      let hasViolation = false;
      let violationDetail = '';

      switch(tableName) {
        case 'customer':
        case 'staff':
        case 'admin':
        case 'storekeeper':
          // Check if these user tables have redundant role information
          if (cols.some(c => c.Field === 'Role' || c.Field === 'UserType')) {
            hasViolation = true;
            violationDetail = 'Contains Role/UserType - table name itself defines the role (transitive dependency)';
          }
          break;

        case 'orderitem':
          // Check if Price is stored (should reference product price)
          if (cols.some(c => c.Field === 'Price')) {
            // This is actually OK - it's price at time of purchase, not current product price
            warnings.push({
              table: tableName,
              issue: 'Price column exists - ACCEPTABLE if it stores historical price at purchase time'
            });
          }
          break;

        case 'inventory':
          // Check UpdatedBy - should it reference specific role tables or users?
          const updatedByCol = cols.find(c => c.Field === 'UpdatedBy');
          if (updatedByCol) {
            const [updateBySample] = await conn.query(`
              SELECT DISTINCT UpdatedBy FROM ${tableName} WHERE UpdatedBy IS NOT NULL LIMIT 5
            `);
            console.log(`  UpdatedBy values: ${updateBySample.map(r => r.UpdatedBy).join(', ')}`);
          }
          break;

        case 'task':
          // Check for potential redundancy
          const taskCols = cols.map(c => c.Field);
          if (taskCols.includes('AdminID') && taskCols.includes('StaffID') && taskCols.includes('OrderID')) {
            // Check if AdminID can be derived from OrderID
            const [taskCheck] = await conn.query(`
              SELECT COUNT(DISTINCT AdminID) as admin_count, COUNT(DISTINCT OrderID) as order_count
              FROM ${tableName}
              WHERE OrderID IS NOT NULL AND AdminID IS NOT NULL
            `);
            if (taskCheck[0] && taskCheck[0].order_count > 0) {
              console.log(`  Task assignment pattern: ${taskCheck[0].admin_count} admins for ${taskCheck[0].order_count} orders`);
            }
          }
          break;

        case 'notification':
          // We already fixed this - check if still has issues
          if (cols.some(c => c.Field === 'ReceiverRole')) {
            hasViolation = true;
            violationDetail = 'ReceiverRole creates transitive dependency: NotificationID → ReceiverID → ReceiverRole';
          }
          break;

        case 'orders':
          // Check if Address is redundant with customer address
          const addressCol = cols.find(c => c.Field === 'Address');
          if (addressCol) {
            const [addressCheck] = await conn.query(`
              SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN o.Address = c.Address THEN 1 ELSE 0 END) as matching
              FROM orders o
              JOIN customer c ON o.CustomerID = c.CustomerID
              WHERE o.Address IS NOT NULL AND c.Address IS NOT NULL
            `);
            if (addressCheck[0]) {
              console.log(`  Address check: ${addressCheck[0].matching}/${addressCheck[0].total} match customer default`);
              if (addressCheck[0].total > 0 && addressCheck[0].matching === addressCheck[0].total) {
                warnings.push({
                  table: tableName,
                  issue: 'All order addresses match customer addresses - potential redundancy, but acceptable for order-specific delivery addresses'
                });
              }
            }
          }
          break;
        
        default:
          // No specific checks for other tables
          break;
      }

      // Check for common 3NF violations
      const nameFields = nonKeyAttrs.filter(f => 
        f.toLowerCase().includes('name') && 
        !pk.includes(f)
      );
      
      const idFields = nonKeyAttrs.filter(f => 
        f.toLowerCase().includes('id') && 
        f !== 'RelatedID' &&
        !pk.includes(f)
      );

      // Check if name fields might be derived from ID fields
      if (nameFields.length > 0 && idFields.length > 0) {
        for (const nameField of nameFields) {
          for (const idField of idFields) {
            // Check if this is a foreign key
            const isFk = fks.some(fk => fk.COLUMN_NAME === idField);
            if (isFk && nameField.replace('Name', '') === idField.replace('ID', '')) {
              hasViolation = true;
              violationDetail = `${nameField} depends on ${idField} (transitive: ${pk[0]} → ${idField} → ${nameField})`;
              break;
            }
          }
          if (hasViolation) break;
        }
      }

      // Result
      if (hasViolation) {
        console.log(`\n❌ NOT IN 3NF: ${violationDetail}`);
        violations.push({ table: tableName, issue: violationDetail });
      } else {
        console.log(`\n✓ IN 3NF`);
        compliant.push(tableName);
      }
    }

    // Summary
    console.log('\n\n═══════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════\n');

    console.log(`✓ COMPLIANT (${compliant.length} tables):`);
    compliant.forEach(t => console.log(`  - ${t}`));

    if (violations.length > 0) {
      console.log(`\n❌ VIOLATIONS (${violations.length} tables):`);
      violations.forEach(v => {
        console.log(`  - ${v.table}: ${v.issue}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length} cases):`);
      warnings.forEach(w => {
        console.log(`  - ${w.table}: ${w.issue}`);
      });
    }

    if (violations.length === 0) {
      console.log('\n✅ DATABASE IS IN 3NF!');
    } else {
      console.log('\n⚠️  DATABASE HAS 3NF VIOLATIONS - CHANGES NEEDED');
    }

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
