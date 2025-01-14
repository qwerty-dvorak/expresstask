const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin, isAuthenticated } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Express',
    user: req.session.userId ? { 
      id: req.session.userId,
      isAdmin: req.session.isAdmin 
    } : null,
    error: req.flash('error')[0],
    success: req.flash('success')[0]
  });
});

/* GET dashboard page. */
router.get('/dashboard', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.flash('error', 'Session expired');
      req.session.destroy();
      return res.redirect('/auth/login');
    }

    res.render('dashboard', { 
      title: 'Dashboard',
      user: {
        username: user.username,
        token: user.token,
        lastTokenUpdate: user.lastTokenUpdate.toLocaleString()
      },
      error: req.flash('error')[0]
    });
  } catch (error) {
    req.flash('error', 'Dashboard access failed');
    next(error);
  }
});

/* GET admin dashboard page. */
router.get('/admin/dashboard', isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    const currentUser = await User.findById(req.session.userId);
    
    res.render('adminDashboard', { 
      title: 'Admin Dashboard',
      users,
      currentUser,
      error: req.flash('error')[0],
      success: req.flash('success')[0]
    });
  } catch (error) {
    req.flash('error', 'Admin dashboard access failed');
    next(error);
  }
});

router.post('/refresh-token', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.token = uuidv4();
    user.lastTokenUpdate = new Date();
    await user.save();
    req.flash('success', 'Token refreshed');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Token refresh failed');
    res.redirect('/dashboard');
  }
});

router.post('/admin/refresh-data', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    req.flash('success', 'Data refreshed');
    res.redirect('/admin/dashboard');
  } catch (error) {
    req.flash('error', 'Refresh failed');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
