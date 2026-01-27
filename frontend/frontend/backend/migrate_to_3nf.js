const pool = require('./config/db');

async function migrateToThirdNormalForm() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting database migration to 3NF...\n');
    
    await connection.beginTransaction();
    
    // Step 1: Backup existing OrderProducts data if it exists
    console.log('1. Checking existing data...');
    const [existingOrders] = await connection.query('SELECT * FROM Orders LIMIT 1');
    const [existingOrderProducts] = await connection.query('SELECT * FROM OrderProducts LIMIT 1');
    console.log(`   Found ${existingOrders.length} orders sample`);
    console.log(`   Found ${existingOrderProducts.length} order products sample`);
    
    // Step 2: Modify OrderProducts table - add new columns first
    console.log('\n2. Adding new columns to OrderProducts...');
    
    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'OrderProducts'
    `);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    
    if (!columnNames.includes('quantity')) {
      await connection.query(`
        ALTER TABLE OrderProducts 
        ADD COLUMN quantity INT NOT NULL DEFAULT 1
      `);
      console.log('   ✓ Added quantity column');
    } else {
      console.log('   ✓ quantity column already exists');
    }
    
    if (!columnNames.includes('price_at_purchase')) {
      await connection.query(`
        ALTER TABLE OrderProducts 
        ADD COLUMN price_at_purchase DECIMAL(10,2) NOT NULL DEFAULT 0.00
      `);
      console.log('   ✓ Added price_at_purchase column');
      
      // Update price_at_purchase with current product prices
      console.log('   ✓ Updating price_at_purchase with current product prices...');
      await connection.query(`
        UPDATE OrderProducts op
        JOIN Products p ON op.product_id = p.id
        SET op.price_at_purchase = p.price
        WHERE op.price_at_purchase = 0.00
      `);
      console.log('   ✓ Updated historical prices');
    } else {
      console.log('   ✓ price_at_purchase column already exists');
    }
    
    // Step 3: Add composite primary key if not exists
    console.log('\n3. Adding composite primary key...');
    try {
      await connection.query(`
        ALTER TABLE OrderProducts 
        DROP PRIMARY KEY
      `);
      console.log('   ✓ Dropped existing primary key');
    } catch (err) {
      console.log('   ✓ No existing primary key to drop');
    }
    
    await connection.query(`
      ALTER TABLE OrderProducts 
      ADD PRIMARY KEY (order_id, product_id)
    `);
    console.log('   ✓ Added composite primary key (order_id, product_id)');
    
    // Step 4: Add CASCADE delete if not exists
    console.log('\n4. Updating foreign key constraints...');
    try {
      // Drop existing foreign key
      const [fks] = await connection.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
        AND TABLE_NAME = 'OrderProducts' 
        AND CONSTRAINT_NAME LIKE '%order_id%'
        AND REFERENCED_TABLE_NAME = 'Orders'
      `);
      
      if (fks.length > 0) {
        await connection.query(`
          ALTER TABLE OrderProducts 
          DROP FOREIGN KEY ${fks[0].CONSTRAINT_NAME}
        `);
        console.log('   ✓ Dropped old order_id foreign key');
      }
      
      // Add new foreign key with CASCADE
      await connection.query(`
        ALTER TABLE OrderProducts 
        ADD CONSTRAINT fk_orderproducts_orders 
        FOREIGN KEY (order_id) REFERENCES Orders(id) 
        ON DELETE CASCADE
      `);
      console.log('   ✓ Added ON DELETE CASCADE to order_id foreign key');
    } catch (err) {
      console.log('   ⚠ Foreign key constraint update: ' + err.message);
    }
    
    // Step 5: Modify Orders table - remove total column
    console.log('\n5. Updating Orders table...');
    
    const [orderColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'Orders'
    `);
    
    const orderColumnNames = orderColumns.map(col => col.COLUMN_NAME);
    
    if (orderColumnNames.includes('total')) {
      await connection.query(`
        ALTER TABLE Orders 
        DROP COLUMN total
      `);
      console.log('   ✓ Removed total column (violates 3NF)');
    } else {
      console.log('   ✓ total column already removed');
    }
    
    if (!orderColumnNames.includes('created_at')) {
      await connection.query(`
        ALTER TABLE Orders 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('   ✓ Added created_at timestamp');
    } else {
      console.log('   ✓ created_at column already exists');
    }
    
    await connection.commit();
    console.log('\n✅ Database successfully migrated to 3NF!');
    console.log('\n📝 Summary of changes:');
    console.log('   • Orders: Removed "total" column (calculated field)');
    console.log('   • Orders: Added "created_at" timestamp');
    console.log('   • OrderProducts: Added "quantity" column');
    console.log('   • OrderProducts: Added "price_at_purchase" column');
    console.log('   • OrderProducts: Added composite PRIMARY KEY (order_id, product_id)');
    console.log('   • OrderProducts: Added ON DELETE CASCADE constraint');
    console.log('\n💡 To calculate order totals, use this query:');
    console.log('   SELECT o.id, SUM(op.quantity * op.price_at_purchase) as total');
    console.log('   FROM Orders o');
    console.log('   LEFT JOIN OrderProducts op ON o.id = op.order_id');
    console.log('   GROUP BY o.id;');
    
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
