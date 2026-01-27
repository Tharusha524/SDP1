const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixViews() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME
  });

  try {
    console.log('🔧 Fixing database views...\n');

    // Drop old views
    console.log('1. Dropping old views...');
    await connection.query('DROP VIEW IF EXISTS vw_orderdetails');
    await connection.query('DROP VIEW IF EXISTS vw_inventorystatus');
    await connection.query('DROP VIEW IF EXISTS vw_staffworkload');
    console.log('   ✅ Old views dropped\n');

    // Recreate vw_orderdetails (3NF compliant - calculate TotalPrice)
    console.log('2. Creating vw_orderdetails...');
    await connection.query(`
      CREATE VIEW vw_orderdetails AS
      SELECT 
        o.OrderID,
        o.OrderDate,
        o.Status as OrderStatus,
        SUM(oi.Quantity * oi.Price) as TotalPrice,
        o.CustomerID,
        c.Name as CustomerName,
        c.Email as CustomerEmail,
        c.ContactNo as CustomerContact,
        COUNT(oi.OrderItemID) as TotalItems
      FROM orders o
      LEFT JOIN customer c ON o.CustomerID = c.CustomerID
      LEFT JOIN orderitem oi ON o.OrderID = oi.OrderID
      GROUP BY o.OrderID, o.OrderDate, o.Status, o.CustomerID, c.Name, c.Email, c.ContactNo
    `);
    console.log('   ✅ vw_orderdetails created\n');

    // Recreate vw_inventorystatus
    console.log('3. Creating vw_inventorystatus...');
    await connection.query(`
      CREATE VIEW vw_inventorystatus AS
      SELECT 
        i.InventoryID,
        i.ProductID,
        p.Name as ProductName,
        p.Category,
        i.AvailableQuantity,
        i.MinimumThreshold,
        CASE 
          WHEN i.AvailableQuantity = 0 THEN 'Out of Stock'
          WHEN i.AvailableQuantity <= i.MinimumThreshold THEN 'Low Stock'
          ELSE 'In Stock'
        END as StockStatus,
        i.LastUpdated
      FROM inventory i
      LEFT JOIN product p ON i.ProductID = p.ProductID
    `);
    console.log('   ✅ vw_inventorystatus created\n');

    // Recreate vw_staffworkload
    console.log('4. Creating vw_staffworkload...');
    await connection.query(`
      CREATE VIEW vw_staffworkload AS
      SELECT 
        s.StaffID,
        s.Name as StaffName,
        s.Email,
        s.Status,
        COUNT(t.TaskID) as TotalTasks,
        SUM(CASE WHEN t.Status = 'Pending' THEN 1 ELSE 0 END) as PendingTasks,
        SUM(CASE WHEN t.Status = 'In Progress' THEN 1 ELSE 0 END) as InProgressTasks,
        SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END) as CompletedTasks
      FROM staff s
      LEFT JOIN task t ON s.StaffID = t.StaffID
      GROUP BY s.StaffID, s.Name, s.Email, s.Status
    `);
    console.log('   ✅ vw_staffworkload created\n');

    console.log('✅ All views fixed and recreated!\n');
    console.log('You can now refresh MySQL without errors.');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

fixViews();
