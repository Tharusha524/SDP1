// authMiddleware.js
// Middleware for authentication and authorization
const jwt = require('jsonwebtoken');

// Secret used to sign and verify JWTs. In production this should be a
// strong secret stored securely (env var or secret manager). A fallback
// is present for local development.
const JWT_SECRET = process.env.JWT_SECRET || 'marukawa-cement-secret-key-2026';

// JWT authentication middleware
// - Reads the `Authorization: Bearer <token>` header
// - Verifies the token and attaches the decoded `user` payload to `req.user`
// - Returns 401 when no token is supplied, 403 when token verification fails
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header (Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    // No token -> unauthorized
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Invalid or expired token -> forbidden
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Attach user data to request for downstream handlers (id, role, etc.)
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
// Usage: `authorizeRole('admin')` or `authorizeRole('staff', 'admin')`
// - Requires that `authenticateToken` has already run and populated `req.user`
// - Checks that the user's role is included in the allowed roles
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      // No authenticated user -> must authenticate first
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    // Role is allowed -> continue
    next();
  };
};

// Export middleware functions for use in route definitions
module.exports = {
  authenticateToken,
  authorizeRole
};
