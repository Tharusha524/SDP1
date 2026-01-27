const pool = require('./config/db');

async function migrateToThirdNormalForm() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database migration to 3NF...\n');
    console.log('Database:', process.env.DB_NAME);
    console.log('------------------------------------------\n');
    
    await connection.beginTransaction();
    
    // Step 1: Remove Subtotal from orderitem (calculated field - violates 3NF)
    console.log('1. Checking orderitem table for 3NF violations...');
    const [orderitemCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'orderitem'
    `);
    
    const orderitemColumns = orderitemCols.map(col => col.COLUMN_NAME);
    
    if (orderitemColumns.includes('Subtotal')) {
      console.log('   ❌ Found Subtotal column (violates 3NF - calculated from Quantity × Price)');
      await connection.query(`ALTER TABLE orderitem DROP COLUMN Subtotal`);
      console.log('   ✅ Removed Subtotal column');
    } else {
      console.log('   ✅ Subtotal column already removed');
    }
    
    // Step 2: Remove TotalPrice from orders (calculated field - violates 3NF)
    console.log('\n2. Checking orders table for 3NF violations...');
    const [ordersCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'orders'
    `);
    
    const ordersColumns = ordersCols.map(col => col.COLUMN_NAME);
    
    if (ordersColumns.includes('TotalPrice')) {
      console.log('   ❌ Found TotalPrice column (violates 3NF - calculated from orderitem)');
      await connection.query(`ALTER TABLE orders DROP COLUMN TotalPrice`);
      console.log('   ✅ Removed TotalPrice column');
    } else {
      console.log('   ✅ TotalPrice column already removed');
    }
    
    // Step 3: Optimize orderitem primary key structure
    console.log('\n3. Analyzing orderitem primary key structure...');
    console.log('   ℹ Current: OrderItemID (surrogate key)');
    console.log('   ℹ This is acceptable for 3NF if you need to reference individual line items');
    console.log('   ℹ Alternative: Composite key (OrderID, ProductID) - but limits 1 product per order');
    console.log('   ✅ Keeping current structure (supports multiple entries of same product)');
    
    await connection.commit();
    
    console.log('\n✅ Database successfully migrated to 3NF!');
    console.log('\n' + '='.repeat(60));
    console.log('📝 SUMMARY OF CHANGES:');
    console.log('='.repeat(60));
    console.log('\n✓ orders table:');
    console.log('  - Removed "TotalPrice" (was calculated from orderitem)');
    console.log('\n✓ orderitem table:');
    console.log('  - Removed "Subtotal" (was calculated as Quantity × Price)');
    console.log('  - Kept OrderItemID as primary key (allows multiple of same product)');
    console.log('\n' + '='.repeat(60));
    console.log('💡 HOW TO CALCULATE VALUES NOW:');
    console.log('='.repeat(60));
    console.log('\n📊 To calculate order total:');
    console.log('   SELECT o.OrderID, o.Status, o.OrderDate,');
    console.log('          SUM(oi.Quantity * oi.Price) as TotalPrice');
    console.log('   FROM orders o');
    console.log('   LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID');
    console.log('   GROUP BY o.OrderID;');
    console.log('\n📦 To calculate line item subtotal:');
    console.log('   SELECT OrderItemID, OrderID, ProductID,');
    console.log('          Quantity, Price,');
    console.log('          (Quantity * Price) as Subtotal');
    console.log('   FROM orderitem;');
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
migrateToThirdNormalForm()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  });
