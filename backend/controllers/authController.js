const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');
const { JWT_SECRET } = require('../middleware/auth');

const toPublicUser = (user) => {
  const { password, ...publicUser } = user;
  return publicUser;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      // Snapshot lets a stateless serverless instance identify the user after a cold start.
      user: toPublicUser(user)
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'CUSTOMER', phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existing = store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = store.createUser({
      name,
      email,
      password: hashedPassword,
      role: ['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'].includes(role) ? role : 'CUSTOMER',
      phone: phone || '+91 98765 43210',
      address: address || {
        street: '124 Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038'
      }
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: toPublicUser(newUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    // The in-memory store resets between serverless instances, so fall back to the
    // verified JWT snapshot injected by the auth middleware.
    const storedUser = store.findUserById(req.user._id);
    const user = storedUser || req.user;
    const notifications = storedUser ? store.getNotifications(storedUser._id) : [];

    res.json({
      success: true,
      user: toPublicUser(user),
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fast switcher for reviewers/demo: switch between Customer, Delivery Partner, Admin in 1 click
 */
exports.switchTestAccount = async (req, res) => {
  try {
    const { role = 'CUSTOMER' } = req.body;
    const user = store.users.find(u => u.role === role);
    if (!user) {
      return res.status(404).json({ success: false, message: `No test user for role ${role}` });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: toPublicUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
