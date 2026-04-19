const mysql = require('mysql2/promise');
require('dotenv').config();

const initDB = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    console.log('Connected to MySQL for initialization...');

    try {
        // Create users table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(20) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'customer', 'storekeeper') DEFAULT 'customer',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Users table ready.');

        // Create product table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS product (
        ProductID VARCHAR(20) PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Description TEXT,
        Price DECIMAL(10, 2) NOT NULL,
        Image VARCHAR(255),
        Category VARCHAR(50) DEFAULT 'General',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('Product table ready.');

        // Create customer table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS customer (
        CustomerID VARCHAR(20) PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(255) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        ContactNo VARCHAR(20) NOT NULL,
        Address VARCHAR(255) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('Customer table ready.');

        // Create orders table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        OrderID VARCHAR(20) PRIMARY KEY,
        CustomerID VARCHAR(20) NOT NULL,
        Status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
        Address VARCHAR(255),
        SpecialInstructions TEXT,
        Details TEXT,
        EstimatedCompletionDate DATE,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (CustomerID) REFERENCES customer(CustomerID)
      )
    `);
        console.log('Orders table ready.');

        // Create order_items junction table (orderitem)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS orderitem (
        OrderItemID VARCHAR(20) PRIMARY KEY,
        OrderID VARCHAR(20) NOT NULL,
        ProductID VARCHAR(20) NOT NULL,
        Quantity INT NOT NULL,
        UnitPriceAtPurchase DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
        FOREIGN KEY (ProductID) REFERENCES product(ProductID)
      )
    `);
        console.log('Order Items table ready.');

        // Create payment table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS payment (
        PaymentID VARCHAR(20) PRIMARY KEY,
        OrderID VARCHAR(20) NOT NULL,
        Amount DECIMAL(10, 2) NOT NULL,
        Method VARCHAR(50) NOT NULL,
        Status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
      )
    `);
        console.log('Payment table ready.');

        // Create task table (without priority column)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS task (
        TaskID VARCHAR(20) PRIMARY KEY,
        AdminID VARCHAR(20),
        StaffID VARCHAR(20),
        OrderID VARCHAR(20),
        Description TEXT NOT NULL,
        AssignedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CompletedDate TIMESTAMP NULL,
        Status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
        FOREIGN KEY (AdminID) REFERENCES users(id),
        FOREIGN KEY (StaffID) REFERENCES staff(StaffID),
        FOREIGN KEY (OrderID) REFERENCES orders(OrderID)
      )
    `);
        console.log('Task table ready.');

        // Create inventory_allocation table (allocation header per order)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_allocation (
        AllocationID VARCHAR(20) PRIMARY KEY,
        OrderID VARCHAR(20) NOT NULL,
        Status ENUM('Allocated', 'Reversed') DEFAULT 'Allocated',
        AllocatedBy VARCHAR(20) NOT NULL,
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (OrderID) REFERENCES orders(OrderID),
        FOREIGN KEY (AllocatedBy) REFERENCES users(id)
      )
    `);
        console.log('Inventory allocation table ready.');

        // Create inventory_allocation_item table (normalized rows per allocated material)
        await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_allocation_item (
        AllocationItemID VARCHAR(20) PRIMARY KEY,
        AllocationID VARCHAR(20) NOT NULL,
        InventoryID VARCHAR(20) NOT NULL,
        Quantity DECIMAL(10, 2) NOT NULL,
        UNIQUE KEY uq_allocation_inventory (AllocationID, InventoryID),
        FOREIGN KEY (AllocationID) REFERENCES inventory_allocation(AllocationID) ON DELETE CASCADE
      )
    `);
        console.log('Inventory allocation item table ready.');
        // Ensure legacy timestamp columns removed from inventory_allocation_item if present
        try {
          const [cCreated] = await connection.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'CreatedAt'");
          if (cCreated.length > 0) {
            await connection.query('ALTER TABLE inventory_allocation_item DROP COLUMN CreatedAt');
          }
          const [cUpdated] = await connection.query("SHOW COLUMNS FROM inventory_allocation_item LIKE 'UpdatedAt'");
          if (cUpdated.length > 0) {
            await connection.query('ALTER TABLE inventory_allocation_item DROP COLUMN UpdatedAt');
          }
        } catch (e) {
          // ignore if table does not exist yet or other harmless errors
        }

        console.log('Database initialization complete!');
    } catch (err) {
        console.error('Error during initialization:', err.message);
    } finally {
        await connection.end();
    }
};

initDB();
