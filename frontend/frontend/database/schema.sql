-- schema.sql
-- Example SQL schema for reference (if using SQL DB)
-- For MongoDB, this file is not required, but included for completeness

-- Users Table
CREATE TABLE Users (
    id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('USR-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') DEFAULT 'customer'
);

-- Products Table
CREATE TABLE Products (
    id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('PRD-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL
);

-- Orders Table
CREATE TABLE Orders (
    id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('ORD-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    user_id VARCHAR(50),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- OrderProducts Table (Junction table with proper structure)
CREATE TABLE OrderProducts (
    order_id VARCHAR(50),
    product_id VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Materials/Inventory Table
CREATE TABLE Materials (
    id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('MAT-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    name VARCHAR(255) NOT NULL,
    stock INT NOT NULL,
    threshold INT NOT NULL
);

-- Tasks Table
CREATE TABLE Tasks (
    id VARCHAR(50) PRIMARY KEY DEFAULT CONCAT('TSK-', LPAD(FLOOR(RAND() * 10000), 4, '0')),
    description TEXT NOT NULL,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    assigned_to VARCHAR(50),
    FOREIGN KEY (assigned_to) REFERENCES Users(id)
);
