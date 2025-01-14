const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Update login GET route
router.get('/login', (req, res) => {
  const error = req.flash('error')[0];
  const success = req.flash('success')[0];
  
  res.render('login', {
    title: 'Login',
    error: error || null,
    success: success || null
  });
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

// Update login POST route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/auth/login');
    }

    // Set session with proper user data
    req.session.userId = user._id;
    req.session.isAdmin = Boolean(user.isAdmin); // Ensure boolean value

    // Role-based redirect
    let redirectUrl;
    if (user.isAdmin) {
      redirectUrl = '/admin/dashboard';
    } else {
      redirectUrl = req.session.returnTo || '/dashboard';
      req.session.returnTo = undefined;
    }
    
    req.flash('success', `Welcome back ${user.username}`);
    res.redirect(redirectUrl);

  } catch (error) {
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/auth/login');
  }
});

// Render admin login page
router.get('/admin/login', (req, res) => {
  res.render('adminLogin', { title: 'Admin Login', error: null });
});

// Update admin login to set proper session data
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !user.isAdmin || !(await bcrypt.compare(password, user.password))) {
      return res.render('adminLogin', { 
        title: 'Admin Login', 
        error: 'Invalid credentials' 
      });
    }

    req.session.userId = user._id;
    req.session.isAdmin = true;
    req.flash('success', 'Admin login successful');
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.render('adminLogin', { 
      title: 'Admin Login', 
      error: 'Login failed' 
    });
  }
});

// Add logout route before module.exports
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;