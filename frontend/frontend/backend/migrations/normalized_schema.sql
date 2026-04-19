-- Marukawa Concrete DB - 13 Tables Schema
-- Actual database structure (exact columns only)

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS marukawa_concrete_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marukawa_concrete_db;

-- Table 1: users (authentication table)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(20) PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','staff','customer','storekeeper') DEFAULT 'customer',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 2: Customer (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Customer` (
  `CustomerID` VARCHAR(20) PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `ContactNo` VARCHAR(20) NOT NULL,
  `Address` VARCHAR(255) NOT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 3: Staff (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Staff` (
  `StaffID` VARCHAR(20) PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `ContactNo` VARCHAR(20),
  `Status` ENUM('Available','Busy','Inactive') DEFAULT 'Available',
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 4: Admin (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Admin` (
  `AdminID` VARCHAR(20) PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 5: Storekeeper (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Storekeeper` (
  `StorekeeperID` VARCHAR(20) PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(255) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `ContactNo` VARCHAR(20),
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 6: pending_registrations
CREATE TABLE IF NOT EXISTS `pending_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `contact` VARCHAR(40),
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','staff','storekeeper','customer') DEFAULT 'customer',
  `verification_token` VARCHAR(16) NOT NULL,
  `token_expires` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 7: product
CREATE TABLE IF NOT EXISTS `product` (
  `ProductID` VARCHAR(20) PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Description` TEXT,
  `Price` DECIMAL(10,2) NOT NULL,
  `Image` VARCHAR(255),
  `Category` VARCHAR(50) DEFAULT 'General',
  `IsActive` TINYINT(1) DEFAULT 1,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 8: orders
CREATE TABLE IF NOT EXISTS `orders` (
  `OrderID` VARCHAR(20) PRIMARY KEY,
  `CustomerID` VARCHAR(20) NOT NULL,
  `Status` ENUM('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending',
  `Address` VARCHAR(255),
  `SpecialInstructions` TEXT,
  `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`CustomerID`) REFERENCES `customer`(`CustomerID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 9: orderitem
CREATE TABLE IF NOT EXISTS `orderitem` (
  `OrderItemID` VARCHAR(20) PRIMARY KEY,
  `OrderID` VARCHAR(20) NOT NULL,
  `ProductID` VARCHAR(20) NOT NULL,
  `Quantity` INT NOT NULL,
  `UnitPriceAtPurchase` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`OrderID`) REFERENCES `orders`(`OrderID`),
  FOREIGN KEY (`ProductID`) REFERENCES `product`(`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 10: Inventory (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Inventory` (
  `InventoryID` VARCHAR(20) PRIMARY KEY,
  `ProductID` VARCHAR(20) NOT NULL,
  `AvailableQuantity` INT NOT NULL DEFAULT 0,
  `MinimumThreshold` INT NOT NULL DEFAULT 0,
  `LastUpdated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UpdatedBy` VARCHAR(20),
  FOREIGN KEY (`ProductID`) REFERENCES `product`(`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 11: Notification (capitalized as used in queries)
CREATE TABLE IF NOT EXISTS `Notification` (
  `NotificationID` VARCHAR(20) PRIMARY KEY,
  `Message` TEXT NOT NULL,
  `Type` VARCHAR(50),
  `IsRead` TINYINT(1) DEFAULT 0,
  `DateTime` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 12: task
CREATE TABLE IF NOT EXISTS `task` (
  `TaskID` VARCHAR(20) PRIMARY KEY,
  `AdminID` VARCHAR(20),
  `StaffID` VARCHAR(20),
  `OrderID` VARCHAR(20),
  `Description` TEXT NOT NULL,
  `AssignedDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `CompletedDate` TIMESTAMP NULL,
  `Status` ENUM('Pending','In Progress','Completed','Cancelled') DEFAULT 'Pending',
  `Priority` ENUM('Low','Medium','High') DEFAULT 'Medium',
  FOREIGN KEY (`AdminID`) REFERENCES `users`(`id`),
  FOREIGN KEY (`StaffID`) REFERENCES `Staff`(`StaffID`),
  FOREIGN KEY (`OrderID`) REFERENCES `orders`(`OrderID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table 13: materials
CREATE TABLE IF NOT EXISTS `materials` (
  `id` VARCHAR(20) PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `threshold` INT NOT NULL DEFAULT 0,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
