# COMPLETE DATABASE SCHEMA DOCUMENTATION
**Database Name:** marukawa_concrete_db  
**Purpose:** Marukawa Concrete Management System  
**Date:** January 27, 2026

---

## 📋 TABLE OF CONTENTS
1. [User Management Tables](#user-management-tables)
2. [Product & Order Tables](#product--order-tables)
3. [Inventory Management Tables](#inventory-management-tables)
4. [Task Management Tables](#task-management-tables)
5. [Notification Tables](#notification-tables)
6. [Authentication & Security Tables](#authentication--security-tables)
7. [Database Views](#database-views)

---

## 1. USER MANAGEMENT TABLES

### 1.1 `admin` Table
**Purpose:** Stores administrator user accounts who manage the entire system

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `AdminID` | VARCHAR(20) | **Primary Key** - Unique identifier for each admin | 'ADM-0001' |
| `Name` | VARCHAR(100) | Full name of the administrator | 'John Silva' |
| `Email` | VARCHAR(255) | Admin's email address (must be unique) | 'admin@marukawa.com' |
| `Password` | VARCHAR(255) | Encrypted/hashed password for login | '$2b$10$...' |
| `CreatedAt` | DATETIME | Timestamp when admin account was created | '2026-01-20 10:30:00' |
| `UpdatedAt` | DATETIME | Timestamp of last account update | '2026-01-25 14:20:00' |

**Usage:** Admin users can manage orders, staff, inventory, and view all system reports.

---

### 1.2 `customer` Table
**Purpose:** Stores customer information who place orders for concrete products

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `CustomerID` | VARCHAR(20) | **Primary Key** - Unique identifier for each customer | 'CUS-0001' |
| `Name` | VARCHAR(100) | Full name of the customer | 'Nuwan Perera' |
| `Email` | VARCHAR(255) | Customer's email address (must be unique) | 'nuwan@email.com' |
| `Password` | VARCHAR(255) | Encrypted/hashed password for customer login | '$2b$10$...' |
| `ContactNo` | VARCHAR(20) | Customer's phone number | '0771234567' |
| `Address` | VARCHAR(255) | Customer's delivery/billing address | '123, Main St, Colombo' |
| `CreatedAt` | DATETIME | When customer registered | '2026-01-15 09:00:00' |
| `UpdatedAt` | DATETIME | Last update to customer profile | '2026-01-20 11:30:00' |

**Usage:** Customers can browse products, place orders, and track their order status.

---

### 1.3 `staff` Table
**Purpose:** Stores staff member information who handle tasks and orders

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `StaffID` | VARCHAR(20) | **Primary Key** - Unique identifier for each staff member | 'STF-0001' |
| `Name` | VARCHAR(100) | Full name of the staff member | 'Kasun Jayasena' |
| `Email` | VARCHAR(255) | Staff's email address (must be unique) | 'kasun@marukawa.com' |
| `Password` | VARCHAR(255) | Encrypted/hashed password for staff login | '$2b$10$...' |
| `ContactNo` | VARCHAR(20) | Staff's phone number | '0712345678' |
| `Status` | ENUM | Current availability status: 'Available', 'Busy', 'Offline' | 'Available' |
| `CreatedAt` | DATETIME | When staff account was created | '2026-01-10 08:00:00' |
| `UpdatedAt` | DATETIME | Last update to staff profile | '2026-01-27 10:00:00' |

**Usage:** Staff members are assigned tasks for order fulfillment and delivery.

---

### 1.4 `storekeeper` Table
**Purpose:** Stores storekeeper accounts who manage inventory and stock

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `StorekeeperID` | VARCHAR(20) | **Primary Key** - Unique identifier for each storekeeper | 'STK-0001' |
| `Name` | VARCHAR(100) | Full name of the storekeeper | 'Saman Kumara' |
| `Email` | VARCHAR(255) | Storekeeper's email address (must be unique) | 'saman@marukawa.com' |
| `Password` | VARCHAR(255) | Encrypted/hashed password | '$2b$10$...' |
| `ContactNo` | VARCHAR(20) | Storekeeper's phone number | '0723456789' |
| `CreatedAt` | DATETIME | When account was created | '2026-01-12 07:00:00' |
| `UpdatedAt` | DATETIME | Last account update | '2026-01-26 09:30:00' |

**Usage:** Storekeepers monitor stock levels, update inventory, and manage warehouse operations.

---

### 1.5 `users` Table
**Purpose:** Unified authentication table for all user types (used for login)

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `id` | VARCHAR(20) | **Primary Key** - User's ID (references specific user table) | 'CUS-0001' or 'ADM-0001' |
| `username` | VARCHAR(255) | Username/email for login (must be unique) | 'nuwan@email.com' |
| `password` | VARCHAR(255) | Encrypted password | '$2b$10$...' |
| `role` | ENUM | User role: 'admin', 'staff', 'storekeeper', 'customer' | 'customer' |
| `is_verified` | TINYINT(1) | Email verification status: 0 = not verified, 1 = verified | 1 |
| `verification_token` | VARCHAR(64) | Token sent via email for verification | 'abc123xyz...' |
| `token_expires` | DATETIME | When verification token expires | '2026-01-28 12:00:00' |
| `reset_code` | VARCHAR(6) | OTP code for password reset | '123456' |
| `reset_expiry` | DATETIME | When reset code expires | '2026-01-27 15:00:00' |
| `pending_data` | TEXT | Temporary storage for registration data before verification | JSON string |

**Usage:** Central authentication table that links to specific user type tables based on role.

---

## 2. PRODUCT & ORDER TABLES

### 2.1 `product` Table
**Purpose:** Stores all concrete products available for sale

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `ProductID` | VARCHAR(20) | **Primary Key** - Unique identifier for each product | 'PRD-0001' |
| `Name` | VARCHAR(100) | Product name | 'Cement Chair' |
| `Description` | TEXT | Detailed product description | 'Beautiful concrete chair with modern design' |
| `Price` | DECIMAL(10,2) | Current selling price in LKR | 4500.00 |
| `Image` | VARCHAR(255) | URL/path to product image | '/images/cement-chair.jpg' |
| `Category` | VARCHAR(50) | Product category | 'Furniture' or 'Decoration' |
| `IsActive` | TINYINT(1) | Product availability: 0 = inactive, 1 = active | 1 |
| `CreatedAt` | DATETIME | When product was added | '2026-01-10 10:00:00' |
| `UpdatedAt` | DATETIME | Last product update | '2026-01-25 14:30:00' |

**Usage:** Displayed in product catalog for customers to browse and purchase.

---

### 2.2 `orders` Table
**Purpose:** Stores customer orders (header information)

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `OrderID` | VARCHAR(20) | **Primary Key** - Unique identifier for each order | 'ORD-0001' |
| `CustomerID` | VARCHAR(20) | **Foreign Key** → customer.CustomerID - Who placed the order | 'CUS-0001' |
| `OrderDate` | DATETIME | When order was placed | '2026-01-20 12:30:00' |
| `Status` | ENUM | Order status: 'Pending', 'In Progress', 'Completed', 'Cancelled' | 'Pending' |
| `Address` | VARCHAR(255) | Delivery address for the order | '123, Main St, Colombo' |
| `SpecialInstructions` | TEXT | Any special delivery or product instructions | 'Please deliver before 5 PM' |
| `CreatedAt` | DATETIME | Order creation timestamp | '2026-01-20 12:30:00' |
| `UpdatedAt` | DATETIME | Last order update | '2026-01-21 09:00:00' |

**Important Notes:**
- ⚠️ **NO `TotalPrice` column** (removed for 3NF compliance)
- Total price is calculated from orderitem table: `SUM(Quantity × Price)`
- This ensures data integrity and follows database normalization rules

**Usage:** Tracks customer orders from placement to completion.

---

### 2.3 `orderitem` Table
**Purpose:** Stores individual products within each order (order line items)

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `OrderItemID` | VARCHAR(20) | **Primary Key** - Unique identifier for each line item | 'OIT-0001' |
| `OrderID` | VARCHAR(20) | **Foreign Key** → orders.OrderID - Which order this item belongs to | 'ORD-0001' |
| `ProductID` | VARCHAR(20) | **Foreign Key** → product.ProductID - Which product was ordered | 'PRD-0001' |
| `Quantity` | INT | Number of units ordered | 2 |
| `Price` | DECIMAL(10,2) | Price per unit **at time of order** (price snapshot) | 4500.00 |

**Important Notes:**
- ⚠️ **NO `Subtotal` column** (removed for 3NF compliance)
- Subtotal is calculated as: `Quantity × Price`
- `Price` stores the product price at the time of order (not current price)
- This preserves price history even if product prices change later

**Example:**
If a customer orders 2 Cement Chairs at 4500.00 each:
- Quantity = 2
- Price = 4500.00
- Subtotal (calculated) = 2 × 4500.00 = 9000.00

**Usage:** Represents individual items within an order, allows multiple products per order.

---

## 3. INVENTORY MANAGEMENT TABLES

### 3.1 `inventory` Table
**Purpose:** Tracks stock levels for all products

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `InventoryID` | VARCHAR(20) | **Primary Key** - Unique identifier for inventory record | 'IN-001' |
| `ProductID` | VARCHAR(20) | **Foreign Key** → product.ProductID - Which product this inventory is for | 'PRD-0001' |
| `AvailableQuantity` | INT | Current stock quantity available | 250 |
| `MinimumThreshold` | INT | Minimum stock level before reorder alert | 50 |
| `LastUpdated` | DATETIME | When inventory was last updated | '2026-01-24 13:35:00' |
| `UpdatedBy` | INT | User ID who last updated inventory | 1 |

**Calculated Fields (not stored):**
- **Stock Status**: 
  - 'Out of Stock' if AvailableQuantity = 0
  - 'Low Stock' if AvailableQuantity ≤ MinimumThreshold
  - 'In Stock' if AvailableQuantity > MinimumThreshold

**Usage:** 
- Monitors product availability
- Triggers low stock alerts
- Prevents overselling
- Helps plan restocking

---

## 4. TASK MANAGEMENT TABLES

### 4.1 `task` Table
**Purpose:** Manages work assignments for staff members

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `TaskID` | VARCHAR(20) | **Primary Key** - Unique identifier for each task | 'T-001' |
| `AdminID` | VARCHAR(20) | **Foreign Key** → admin.AdminID - Admin who created the task | 'ADM-0001' |
| `StaffID` | VARCHAR(20) | **Foreign Key** → staff.StaffID - Staff assigned to task | 'STF-0001' |
| `OrderID` | VARCHAR(20) | **Foreign Key** → orders.OrderID - Related order (if applicable) | 'ORD-0001' |
| `Description` | TEXT | Task details and instructions | 'Deliver cement order to customer' |
| `AssignedDate` | DATETIME | When task was assigned | '2026-01-20 12:32:00' |
| `CompletedDate` | DATETIME | When task was completed (NULL if not completed) | '2026-01-21 10:00:00' |
| `Status` | ENUM | Task status: 'Pending', 'In Progress', 'Completed', 'Cancelled' | 'Pending' |
| `Priority` | ENUM | Task priority: 'Low', 'Medium', 'High' | 'High' |

**Usage:**
- Admins assign tasks to staff
- Staff view their assigned tasks
- Track task completion
- Link tasks to specific orders

---

## 5. NOTIFICATION TABLES

### 5.1 `notification` Table
**Purpose:** Stores system notifications for all users

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `NotificationID` | VARCHAR(20) | **Primary Key** - Unique identifier for each notification | 'NO-001' |
| `Message` | TEXT | Notification message content | 'Your order O001 has been completed' |
| `Type` | ENUM | Notification type: 'Order Update', 'Low Stock Alert', 'Task Assignment', 'General' | 'Order Update' |
| `ReceiverRole` | ENUM | Target user role: 'Customer', 'Admin', 'Staff', 'Storekeeper' | 'Customer' |
| `ReceiverID` | INT | Specific user ID (optional) | 1 |
| `IsRead` | TINYINT(1) | Read status: 0 = unread, 1 = read | 0 |
| `RelatedOrderID` | VARCHAR(20) | **Foreign Key** → orders.OrderID - Related order (if applicable) | 'ORD-0001' |
| `DateTime` | DATETIME | When notification was created | '2026-01-20 12:32:00' |

**Notification Types Explained:**
- **Order Update**: Order status changed (e.g., shipped, delivered)
- **Low Stock Alert**: Inventory below minimum threshold
- **Task Assignment**: New task assigned to staff
- **General**: System announcements or general messages

**Usage:**
- Real-time alerts for users
- Order status updates for customers
- Low stock alerts for admins/storekeepers
- Task notifications for staff

---

## 6. AUTHENTICATION & SECURITY TABLES

### 6.1 `email_verifications` Table
**Purpose:** Manages email verification tokens for new registrations

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `id` | INT | **Primary Key** - Auto-incrementing ID | 1 |
| `user_id` | VARCHAR(20) | User ID awaiting verification | 'CUS-0001' |
| `email` | VARCHAR(255) | Email address to verify | 'customer@email.com' |
| `token` | VARCHAR(255) | Unique verification token (sent via email) | 'abc123xyz789...' |
| `expires_at` | DATETIME | Token expiration time | '2026-01-28 12:00:00' |
| `created_at` | TIMESTAMP | When verification was created | '2026-01-27 12:00:00' |

**Usage:**
- New users receive verification email
- Token validates email ownership
- Prevents fake registrations

---

### 6.2 `pending_registrations` Table
**Purpose:** Temporarily stores registration data before email verification

| Column Name | Data Type | Description | Example |
|-------------|-----------|-------------|---------|
| `id` | INT | **Primary Key** - Auto-incrementing ID | 1 |
| `name` | VARCHAR(255) | Full name from registration | 'John Doe' |
| `email` | VARCHAR(255) | Email address (must be unique) | 'john@email.com' |
| `contact` | VARCHAR(50) | Phone number | '0771234567' |
| `password` | VARCHAR(255) | Encrypted password | '$2b$10$...' |
| `role` | VARCHAR(50) | User role | 'customer' |
| `verification_token` | VARCHAR(6) | 6-digit OTP code | '123456' |
| `token_expires` | DATETIME | OTP expiration time | '2026-01-27 13:00:00' |
| `created_at` | TIMESTAMP | Registration attempt time | '2026-01-27 12:30:00' |

**Usage:**
- Stores incomplete registrations
- Deleted after email verification
- Prevents spam registrations

---

## 7. DATABASE VIEWS

### 7.1 `vw_inventorystatus` View
**Purpose:** Provides inventory information with calculated stock status

**Columns Included:**
| Column | Description |
|--------|-------------|
| `InventoryID` | Inventory record ID |
| `ProductID` | Product identifier |
| `ProductName` | Product name |
| `Category` | Product category |
| `AvailableQuantity` | Current stock level |
| `MinimumThreshold` | Reorder threshold |
| `StockStatus` | **Calculated**: 'In Stock', 'Low Stock', or 'Out of Stock' |
| `LastUpdated` | Last inventory update time |

**Usage:** Quick inventory status overview without complex queries.

---

### 7.2 `vw_orderdetails` View
**Purpose:** Provides complete order information with customer details

**Columns Included:**
| Column | Description |
|--------|-------------|
| `OrderID` | Order identifier |
| `OrderDate` | When order was placed |
| `OrderStatus` | Current order status |
| `TotalPrice` | **Calculated**: Sum of all order items |
| `CustomerID` | Customer identifier |
| `CustomerName` | Customer full name |
| `CustomerEmail` | Customer email |
| `CustomerContact` | Customer phone |
| `TotalItems` | **Calculated**: Count of items in order |

**Usage:** Complete order overview for admin dashboard.

---

### 7.3 `vw_staffworkload` View
**Purpose:** Shows staff members with their task workload

**Columns Included:**
| Column | Description |
|--------|-------------|
| `StaffID` | Staff identifier |
| `StaffName` | Staff full name |
| `Email` | Staff email |
| `Status` | Current availability status |
| `TotalTasks` | **Calculated**: Total assigned tasks |
| `PendingTasks` | **Calculated**: Tasks not yet started |
| `InProgressTasks` | **Calculated**: Tasks being worked on |
| `CompletedTasks` | **Calculated**: Finished tasks |

**Usage:** Staff workload monitoring and task distribution.

---

## 📊 DATABASE RELATIONSHIPS

### Entity Relationship Summary:

```
admin
  └── task (AdminID)

customer
  └── orders (CustomerID)

staff
  └── task (StaffID)

storekeeper
  (Independent - manages inventory)

product
  ├── inventory (ProductID)
  └── orderitem (ProductID)

orders
  ├── orderitem (OrderID)
  ├── task (OrderID)
  └── notification (RelatedOrderID)

users
  (Links to admin, customer, staff, or storekeeper based on role)
```

---

## 🔑 KEY POINTS FOR UNDERSTANDING

### 1. **User Management**
- 5 user types: admin, customer, staff, storekeeper, and unified users table
- Each has specific role and permissions
- `users` table is for authentication, others store role-specific data

### 2. **Order Processing**
- Orders are split into 2 tables: `orders` (header) + `orderitem` (details)
- This allows multiple products per order
- Prices are stored in `orderitem` to preserve price history

### 3. **3NF Compliance**
- NO calculated fields stored (TotalPrice, Subtotal)
- All totals calculated dynamically using SUM/GROUP BY
- This prevents data inconsistency

### 4. **Inventory Control**
- Each product can have inventory record
- Low stock alerts when AvailableQuantity ≤ MinimumThreshold
- StockStatus calculated, not stored

### 5. **Task Management**
- Tasks can be linked to orders
- Staff assigned by admin
- Priority and status tracking

### 6. **Notifications**
- Role-based notifications
- Can be linked to orders
- Read/unread tracking

---

## 📝 SUMMARY TABLE

| Table Name | Primary Purpose | Record Count (Example) |
|------------|-----------------|------------------------|
| admin | Administrator accounts | ~5 users |
| customer | Customer accounts | ~1000+ users |
| staff | Staff member accounts | ~20 users |
| storekeeper | Warehouse staff accounts | ~5 users |
| users | Unified login authentication | All users combined |
| product | Available concrete products | ~50 products |
| orders | Customer orders (header) | ~500+ orders |
| orderitem | Order line items | ~1000+ items |
| inventory | Stock levels | ~50 records |
| task | Staff work assignments | ~100+ tasks |
| notification | User notifications | ~500+ notifications |
| email_verifications | Email verification tokens | Temporary records |
| pending_registrations | Pending signups | Temporary records |

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Status:** Complete and Verified ✅
