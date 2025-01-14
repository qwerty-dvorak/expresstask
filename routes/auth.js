const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Render login page
router.get('/login', (req, res) => {
  const success = req.query.success;
  res.render('login', { title: 'Login', error: null, success });
});

// Render register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { 
        title: 'Register', 
        error: 'Username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      token: uuidv4()
    });
    await user.save();
    res.redirect('/auth/login?success=User created successfully');
  } catch (error) {
    res.render('register', { 
      title: 'Register', 
      error: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { 
        title: 'Login', 
        error: 'Invalid credentials' 
      });
    }
    res.redirect(`/dashboard?userId=${user._id}`);
  } catch (error) {
    res.render('login', { 
      title: 'Login', 
      error: error.message 
    });
  }
});

// Render admin login page
router.get('/admin/login', (req, res) => {
  res.render('adminLogin', { title: 'Admin Login', error: null });
});

// Handle admin login
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Hardcoded admin credentials
  const adminUsername = 'admin';
  const adminPassword = 'admin123';

  if (username === adminUsername && password === adminPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('adminLogin', { 
      title: 'Admin Login', 
      error: 'Invalid credentials' 
    });
  }
});

// Add logout route before module.exports
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('/');
      }
      res.redirect('/auth/login?success=Logged out successfully');
    });
  } else {
    res.redirect('/auth/login');
  }
});

module.exports = router;