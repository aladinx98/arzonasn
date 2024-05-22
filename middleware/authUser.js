const jwt = require('jsonwebtoken');
const User = require('../models/Contractor');
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

const authUser = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authUser;
