# Marukawa Concrete Backend API

Express.js REST API server for the Marukawa Concrete Management System.

## 🔧 Tech Stack

- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **MySQL2** - Database driver with promise support
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

---

## 📦 Installation

```bash
cd backend
npm install
```

---

## ⚙ Configuration

### 1. Create `.env` file

```bash
copy .env.example .env
```

### 2. Configure environment variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=marukawa_concrete_db
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Server
PORT=5000
NODE_ENV=development
```

### 3. Setup Database

```sql
CREATE DATABASE marukawa_concrete_db;
USE marukawa_concrete_db;
source migrations/normalized_schema.sql;
```

---

## 🚀 Running the Server

### Development Mode
```bash
node server.js
```

### With Auto-Restart (Nodemon)
```bash
npm run dev
```

Server will start on: `http://localhost:5000`

---

## 📡 API Endpoints

### Health Check
```
GET  /                     # Server status
GET  /api/test-db          # Database connection test
```

### Authentication (`/api/auth`)
```
POST /register             # Register new user
POST /login                # User login
POST /verify-otp           # Verify email OTP
POST /resend-otp           # Resend OTP code
POST /forgot-password      # Request password reset
POST /reset-password       # Reset password with token
GET  /profile              # Get user profile [Protected]
```

### Products (`/api/products`)
```
GET    /                   # Get all products
GET    /:id                # Get product by ID
POST   /                   # Create product [Admin]
PUT    /:id                # Update product [Admin]
DELETE /:id                # Delete product [Admin]
```

### Orders (`/api/orders`)
```
GET    /                   # Get all orders
GET    /:id                # Get order by ID
POST   /                   # Create order [Customer]
PUT    /:id                # Update order status [Staff/Admin]
DELETE /:id                # Cancel order
```

### Inventory (`/api/inventory`)
```
GET    /                   # Get all inventory
GET    /:id                # Get inventory by product ID
PUT    /:id                # Update stock [Storekeeper/Admin]
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. User registers → Receives OTP via email
2. User verifies OTP → Account activated
3. User logs in → Receives JWT token
4. Use token in subsequent requests

### Protected Routes

Include JWT token in request headers:
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```javascript
const response = await axios.get('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 📧 Email Service

### Gmail Configuration

1. **Enable 2-Factor Authentication**
   - Go to Google Account Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Add to `.env`**
   ```env
   EMAIL_USER=yourname@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

### Test Email
```bash
node test_email_service.js
```

---

## 🧪 Testing Scripts

### Test Database Connection
```bash
node test_mysql_connection.js
```
Expected: ✅ Connection successful

### Test Authentication
```bash
node test_jwt_auth.js
```
Tests JWT token generation and verification

### Test OTP System
```bash
node test_otp_system.js
```
Tests email OTP delivery and verification

### Test Product CRUD
```bash
node test_product_crud.js
```
Tests all product CRUD operations

### Test Registration
```bash
node test_register.js
```
Tests user registration endpoint

### Test Login
```bash
node test_login.py
```
Tests login endpoint (Python script)

---

## 📂 Project Structure

```
backend/
├── config/
│   └── db.js                    # MySQL connection pool
│
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── productController.js     # Product operations
│   ├── orderController.js       # Order management
│   └── inventoryController.js   # Inventory operations
│
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   └── roleMiddleware.js        # Role-based access control
│
├── models/
│   ├── Product.js               # Product data model
│   ├── Order.js                 # Order data model
│   └── Inventory.js             # Inventory data model
│
├── routes/
│   ├── auth.js                  # Auth routes
│   ├── products.js              # Product routes
│   ├── orders.js                # Order routes
│   └── inventory.js             # Inventory routes
│
├── utils/
│   ├── emailService.js          # Email utilities
│   ├── idGenerator.js           # ID generation (ADM-0001, etc.)
│   └── validators.js            # Input validation
│
├── migrations/
│   └── normalized_schema.sql    # Database schema (3NF)
│
├── server.js                    # Express app entry point
├── package.json                 # Dependencies
└── .env                         # Environment variables
```

---

## 🗄 Database Models

### User Types
- **Admin** - Full system access
- **Customer** - Place orders, track orders
- **Staff** - Manage tasks, update orders
- **Storekeeper** - Manage inventory

### Tables
- `users` - Unified authentication
- `admin`, `customer`, `staff`, `storekeeper` - Role-specific data
- `product` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `inventory` - Stock management
- `tasks` - Staff assignments
- `notifications` - System alerts
- `otp_verification` - Email verification codes

---

## 🛡 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **OTP Verification** - 6-digit email codes (5-min expiry)
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Whitelist allowed origins
- **Input Validation** - Server-side validation
- **Rate Limiting** - Prevent brute force (TODO)
- **HTTPS** - SSL/TLS encryption (Production)

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔧 Troubleshooting

### Port 5000 already in use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### MySQL connection refused
1. Check MySQL service is running:
   ```bash
   # Windows - Check service
   sc query MySQL80
   ```

2. Verify credentials in `.env`

3. Test connection:
   ```bash
   mysql -u root -p
   ```

### Email not sending
1. Verify Gmail App Password (not regular password)
2. Check 2FA is enabled on Google account
3. Test email service:
   ```bash
   node test_email_service.js
   ```

### JWT authentication fails
1. Check JWT_SECRET in `.env`
2. Verify token format: `Bearer <token>`
3. Check token expiration (default: 24h)
4. Test JWT:
   ```bash
   node test_jwt_auth.js
   ```

---

## 📚 Documentation

- **[DATABASE_SCHEMA_DOCUMENTATION.md](DATABASE_SCHEMA_DOCUMENTATION.md)** - Complete DB schema
- **[PRODUCT_CRUD_DOCUMENTATION.md](PRODUCT_CRUD_DOCUMENTATION.md)** - Product API guide
- **[OTP_IMPLEMENTATION_SUMMARY.md](OTP_IMPLEMENTATION_SUMMARY.md)** - OTP system details
- **[JWT_IMPLEMENTATION.md](JWT_IMPLEMENTATION.md)** - JWT authentication guide
- **[EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)** - Email setup guide
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide

---

## 🚀 Deployment

### Environment Variables
Ensure all production values are set:
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<strong-password>
```

### Database
- Use connection pooling
- Enable SSL for database connection
- Regular backups

### Security
- Enable HTTPS
- Add rate limiting
- Set up firewall rules
- Use environment-specific configs

---

## 📄 License

Academic Software Development Project - SDP1

---

## 🆘 Support

For issues:
1. Check test scripts in current directory
2. Review documentation files
3. Check `server_log.txt` for errors
4. Verify database schema with:
   ```bash
   node check_tables.js
   ```

---

**Backend API ready for Marukawa Concrete Management System** 🏗️
