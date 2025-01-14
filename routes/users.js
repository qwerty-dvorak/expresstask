const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(new Error('Failed to fetch users'));
  }
});

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(new Error('Failed to fetch profile'));
  }
});

module.exports = router;
