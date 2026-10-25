const jwt = require('jsonwebtoken');
const store = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'fashion_rental_jwt_secret_key_2026_super_secure!';

/**
 * Authentication Middleware
 * Validates JWT token and attaches user profile to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const storedUser = store.findUserById(decoded.id);

    if (storedUser) {
      req.user = storedUser;
      return next();
    }

    // Serverless cold starts reset the in-memory store. The signed token already
    // carries a password-free user snapshot, so trust it instead of logging out.
    const snapshot = decoded.user && typeof decoded.user === 'object' ? decoded.user : {};
    req.user = {
      ...snapshot,
      _id: decoded.id,
      name: snapshot.name || (decoded.email ? decoded.email.split('@')[0] : 'Rentique member'),
      email: snapshot.email || decoded.email,
      role: snapshot.role || decoded.role || 'CUSTOMER'
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to specified roles (e.g., 'ADMIN', 'DELIVERY_PARTNER', 'CUSTOMER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(', ')}] role. Current role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize, JWT_SECRET };
