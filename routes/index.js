const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

/* GET dashboard page. */
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.redirect('/auth/login');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/auth/login');
    }

    res.render('dashboard', { 
      title: 'Dashboard',
      user: {
        username: user.username,
        token: user.token,
        lastTokenUpdate: user.lastTokenUpdate.toLocaleString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/* GET admin dashboard page. */
router.get('/admin/dashboard', isAdmin, async (req, res, next) => {
  try {
    const users = await User.find({});
    res.render('adminDashboard', { 
      title: 'Admin Dashboard',
      users
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
