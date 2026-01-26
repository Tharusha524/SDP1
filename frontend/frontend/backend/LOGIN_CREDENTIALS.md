# 🔐 Login Credentials - Marukawa Concrete System

## ⚠️ IMPORTANT SECURITY INFORMATION

**All passwords are now stored as BCRYPT HASHES in the MySQL database.**
- Password Column Type: `VARCHAR(255)` (sufficient for bcrypt - stores 60 chars)
- Hashing Algorithm: **bcrypt with 10 salt rounds**
- Plain-text passwords are NEVER stored in the database
- The authentication system uses `bcrypt.compare()` to verify passwords

---

## 👤 Admin Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| (A-0001 email) | `Admin@123` | admin | Sanduni Silva |
| (A-0002 email) | `Admin@124` | admin | Kamal Perera |

---

## 👷 Staff Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| (S-0001 email) | `Staff@123` | staff | kasun jayasena |
| (S-0002 email) | `Staff@124` | staff | Nimal Bandara |
| (S-0003 email) | `Staff@125` | staff | Saman Kumara |
| (S-0004 email) | `Staff@126` | staff | tharusha harsha |
| (S-0005 email) | `Staff@127` | staff | Test Staff User |
| (S-0006 email) | `Staff@128` | staff | tharusha silvaa |

---

## 🛍️ Customer Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| (CUS-0001 email) | `Customer@123` | customer | Nuwan Perera |
| (CUS-0002 email) | `Customer@124` | customer | Amali Fernando |
| (CUS-0003 email) | `Customer@125` | customer | Ranil Silva |
| (CUS-0004 email) | `Customer@126` | customer | tharuwa |

---

## 📦 Storekeeper Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| (SK-0001 email) | `Storekeeper@123` | storekeeper | Ruwan Fernando |
| (SK-0002 email) | `Storekeeper@124` | storekeeper | tharushaweera |

---

## 🔄 Unified Users Table

| Email | Password | Role |
|-------|----------|------|
| admin@marukawa.com | `Admin@123` | admin |
| staff@marukawa.com | `Staff@123` | staff |
| keeper@marukawa.com | `Storekeeper@123` | storekeeper |
| customer@marukawa.com | `Customer@123` | customer |
| newuser@marukawa.com | `Customer@124` | customer |
| tharu@cementlk.com | `Staff@124` | staff |
| teststaff5@example.com | `Staff@125` | staff |
| silva@cementlk.com | `Staff@126` | staff |
| weera@cementlk.com | `Storekeeper@124` | storekeeper |
| harsha@gmail.com | `Customer@125` | customer |

---

## 📝 Password Pattern

Passwords follow this format:
- **Admin**: `Admin@123`, `Admin@124`, `Admin@125`, ...
- **Staff**: `Staff@123`, `Staff@124`, `Staff@125`, ...
- **Customer**: `Customer@123`, `Customer@124`, `Customer@125`, ...
- **Storekeeper**: `Storekeeper@123`, `Storekeeper@124`, `Storekeeper@125`, ...

---

## 🔧 Technical Implementation

### Database Changes
```sql
-- Password columns in all tables remain VARCHAR(255)
-- No schema changes needed - VARCHAR(255) is sufficient for bcrypt hashes

-- Example of stored hash (60 characters):
-- $2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO
```

### Authentication Flow

**Registration:**
```javascript
1. User submits: { email, password, name, role }
2. Backend hashes password: bcrypt.hash(password, 10)
3. Hashed password stored in database
4. User created successfully
```

**Login:**
```javascript
1. User submits: { email, password }
2. Backend fetches user from database
3. Compares: bcrypt.compare(inputPassword, storedHash)
4. If match: return success + JWT token
5. If no match: return 401 Unauthorized
```

### Code Files Modified

1. **`authController.js`** - Added bcrypt hashing for login/registration
2. **`User.js`** - Imported bcrypt for password utilities
3. **`update_passwords.js`** - Script to update existing passwords

---

## 🚀 How to Test

```bash
# Test login with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marukawa.com","password":"Admin@123"}'

# Test registration with curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"New User",
    "email":"newuser@example.com",
    "password":"NewUser@123",
    "contact":"0771234567",
    "role":"customer"
  }'
```

---

## ⚠️ Security Notes

✅ **Implemented:**
- Bcrypt password hashing (10 rounds)
- Secure password comparison
- No plain-text password storage

⚠️ **Still Needed (Recommended):**
- JWT token implementation (currently uses dummy token)
- Password strength validation
- Account lockout after failed attempts
- Password reset functionality with tokens
- Email verification on registration
- HTTPS in production

---

**Last Updated:** January 25, 2026
**Password Update Script:** `update_passwords.js`
