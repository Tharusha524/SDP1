# Marukawa Concrete Management System

A comprehensive full-stack web application for managing concrete product orders, inventory, staff tasks, and customer relationships. Built with React, Node.js, Express, and MySQL.

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Features

### User Management
- **Multi-Role Authentication** (Admin, Customer, Staff, Storekeeper)
- **OTP Email Verification** for new registrations
- **JWT-based Authentication** with secure token management
- **Password Reset** functionality via email
- User profile management

### Product Catalog
- **CRUD Operations** for products (Create, Read, Update, Delete)
- Product categorization and search
- Image upload with preview
- Price and inventory tracking
- Soft delete with IsActive flag

### Order Management
- Customer order placement
- Real-time order tracking
- Order status updates (Pending, Processing, Completed, Cancelled)
- Order history and analytics

### Inventory Management
- Real-time stock tracking
- Low stock alerts
- Inventory updates by storekeepers
- Product availability management

### Task Management
- Staff task assignment
- Task status tracking (Pending, In Progress, Completed)
- Priority levels
- Task history

### Notifications
- Real-time system notifications
- Email notifications for important events
- User-specific notification management

---

## 🛠 Tech Stack

### Frontend
- **React 19.2.3** - UI framework
- **React Router Dom 6.30.3** - Client-side routing
- **Axios 1.6.0** - HTTP client
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Framer Motion 12.27.1** - Animation library
- **React Icons 5.5.0** - Icon library
- **Styled Components 6.3.8** - CSS-in-JS styling

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **MySQL2 3.16.1** - Database driver
- **JWT (jsonwebtoken 9.0.3)** - Authentication
- **Bcrypt 6.0.0** - Password hashing
- **Nodemailer 7.0.12** - Email service
- **dotenv 16.6.1** - Environment configuration
- **CORS 2.8.5** - Cross-origin resource sharing

### Database
- **MySQL** - Relational database
- 3NF Normalized schema
- Foreign key relationships
- Database views for complex queries

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

---

## 💻 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SDP1/frontend/frontend
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

---

## ⚙ Configuration

### 1. Database Setup

**Create Database:**
```sql
CREATE DATABASE marukawa_concrete_db;
USE marukawa_concrete_db;
```

**Run Database Migrations:**
```bash
cd backend
# Run the normalized schema migration
mysql -u root -p marukawa_concrete_db < migrations/normalized_schema.sql
```

### 2. Environment Variables

**Create `.env` file in backend directory:**
```bash
cd backend
copy .env.example .env
```

**Edit `.env` with your configuration:**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=marukawa_concrete_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Email Configuration (Gmail)
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication if not already enabled
3. Generate App Password for "Mail"
4. Use the 16-character password in EMAIL_PASSWORD

### 3. Initialize Database with Test Data (Optional)
```bash
cd backend
node init-db.js
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd backend
node server.js
# OR with nodemon for auto-restart
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend/frontend
npm start
```
Frontend will open on: `http://localhost:3000`

### Production Build
```bash
# Build frontend for production
npm run build

# Serve production build (requires serve package)
npx serve -s build -l 3000
```

---

## 📁 Project Structure

```
SDP1/frontend/frontend/
├── backend/
│   ├── config/
│   │   └── db.js                  # Database connection
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── productController.js   # Product CRUD operations
│   │   ├── orderController.js     # Order management
│   │   └── inventoryController.js # Inventory operations
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── roleMiddleware.js      # Role-based access control
│   ├── models/
│   │   ├── Product.js             # Product model
│   │   ├── Order.js               # Order model
│   │   └── Inventory.js           # Inventory model
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── products.js            # Product routes
│   │   ├── orders.js              # Order routes
│   │   └── inventory.js           # Inventory routes
│   ├── utils/
│   │   └── emailService.js        # Email sending utilities
│   ├── migrations/
│   │   └── normalized_schema.sql  # Database schema
│   ├── server.js                  # Express server entry point
│   ├── package.json
│   └── .env                       # Environment variables
│
├── src/
│   ├── components/                # Reusable React components
│   ├── assets/                    # Images, icons, etc.
│   ├── App.js                     # Main app component
│   ├── LandingPage.jsx            # Home page
│   ├── LoginPage.jsx              # Login form
│   ├── Register.jsx               # Registration form
│   ├── VerifyEmail.jsx            # OTP verification
│   ├── AdminDashboard.jsx         # Admin panel
│   ├── CatalogManage.js           # Product management
│   ├── HandleInventory.js         # Inventory management
│   ├── PlaceOrder.js              # Order placement
│   ├── TrackOrder.js              # Order tracking
│   └── StaffTasks.js              # Task management
│
├── public/                        # Static files
├── package.json
└── README.md                      # This file
```

---

## 👥 User Roles

### 1. Admin (ADM-XXXX)
- Full system access
- Manage all users, products, orders
- View analytics and reports
- System configuration

**Test Credentials:**
```
Email: admin@marukawa.com
Password: Admin@12345
```

### 2. Customer (CUS-XXXX)
- Browse product catalog
- Place and track orders
- Manage profile
- View order history

**Registration:** `http://localhost:3000/register`

### 3. Staff (STF-XXXX)
- View assigned tasks
- Update task status
- View product catalog
- Update order status

**Test Credentials:**
```
Email: staff@marukawa.com
Password: Staff@12345
```

### 4. Storekeeper (STK-XXXX)
- Manage inventory
- Update stock levels
- View product catalog
- Monitor stock alerts

**Test Credentials:**
```
Email: storekeeper@marukawa.com
Password: Store@12345
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/verify-otp        # Verify email OTP
POST   /api/auth/resend-otp        # Resend OTP
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with token
GET    /api/auth/profile           # Get user profile (protected)
```

### Products
```
GET    /api/products               # Get all products
GET    /api/products/:id           # Get single product
POST   /api/products               # Create product (admin)
PUT    /api/products/:id           # Update product (admin)
DELETE /api/products/:id           # Delete product (admin)
```

### Orders
```
GET    /api/orders                 # Get all orders
GET    /api/orders/:id             # Get single order
POST   /api/orders                 # Create order (customer)
PUT    /api/orders/:id             # Update order status
DELETE /api/orders/:id             # Cancel order
```

### Inventory
```
GET    /api/inventory              # Get all inventory
GET    /api/inventory/:id          # Get inventory by product
PUT    /api/inventory/:id          # Update stock (storekeeper)
```

**Note:** Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 🗄 Database Schema

### Key Tables
- **users** - Unified authentication table
- **admin** - Administrator accounts
- **customer** - Customer accounts
- **staff** - Staff member accounts
- **storekeeper** - Storekeeper accounts
- **product** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items
- **inventory** - Stock management
- **tasks** - Staff task assignments
- **notifications** - System notifications
- **otp_verification** - Email verification codes

**For complete schema documentation, see:** [DATABASE_SCHEMA_DOCUMENTATION.md](backend/DATABASE_SCHEMA_DOCUMENTATION.md)

---

## 🧪 Testing

### Test Database Connection
```bash
cd backend
node test_mysql_connection.js
```

### Test Authentication
```bash
node test_jwt_auth.js
```

### Test OTP System
```bash
node test_otp_system.js
```

### Test Product CRUD
```bash
node test_product_crud.js
```

### Run Frontend Tests
```bash
npm test
```

---

## 📚 Documentation

Comprehensive documentation is available in the following files:

- **[QUICK_START_CRUD.md](QUICK_START_CRUD.md)** - Quick start guide for CRUD operations
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- **[DATABASE_SCHEMA_DOCUMENTATION.md](backend/DATABASE_SCHEMA_DOCUMENTATION.md)** - Database schema reference
- **[PRODUCT_CRUD_DOCUMENTATION.md](backend/PRODUCT_CRUD_DOCUMENTATION.md)** - Product API documentation
- **[OTP_IMPLEMENTATION_SUMMARY.md](backend/OTP_IMPLEMENTATION_SUMMARY.md)** - OTP system details
- **[JWT_IMPLEMENTATION.md](backend/JWT_IMPLEMENTATION.md)** - JWT authentication guide
- **[EMAIL_VERIFICATION_SETUP.md](backend/EMAIL_VERIFICATION_SETUP.md)** - Email setup guide
- **[SYSTEM_FLOW_DIAGRAM.md](SYSTEM_FLOW_DIAGRAM.md)** - System architecture diagrams

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if MySQL is running
mysql -u root -p

# Check if port 5000 is available
netstat -ano | findstr :5000

# Verify .env configuration
type backend\.env
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is available
netstat -ano | findstr :3000
```

### Database connection errors
1. Verify MySQL service is running
2. Check credentials in `.env` file
3. Ensure database `marukawa_concrete_db` exists
4. Check if user has proper privileges:
```sql
GRANT ALL PRIVILEGES ON marukawa_concrete_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Email not sending
1. Verify Gmail App Password (not regular password)
2. Enable 2-Factor Authentication on Google account
3. Test email configuration:
```bash
node test_email_service.js
```

### CORS errors
- Ensure backend is running on port 5000
- Check CORS configuration in `server.js`
- Verify frontend URL in CORS allowed origins

---

## 📝 Common Commands

```bash
# Start both servers
cd backend && node server.js                    # Terminal 1
cd frontend/frontend && npm start               # Terminal 2

# Database
mysql -u root -p marukawa_concrete_db          # Connect to DB
source backend/migrations/normalized_schema.sql # Run migrations

# Testing
cd backend && node test_product_crud.js        # Test CRUD operations
npm test                                        # Run React tests

# Production build
npm run build                                   # Build frontend
npx serve -s build                             # Serve production build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of an academic software development project.

---

## 👨‍💻 Authors

Software Development Project - SDP1
University Project - 2026

---

## 🎯 Quick Links

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Test:** http://localhost:5000/api/test-db
- **Database:** marukawa_concrete_db

---

## 🆘 Support

For issues and questions:
1. Check the [Documentation](#-documentation) section
2. Review [Troubleshooting](#-troubleshooting) guide
3. Check existing issues in the repository
4. Contact the development team

---

**Built with ❤️ by the SDP1 Team**
