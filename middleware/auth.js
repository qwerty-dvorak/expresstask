const User = require('../models/User');

const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.session.isAdmin) {
      return res.redirect('/dashboard');
    }
    const user = await User.findById(req.session.userId);
    if (!user?.isAdmin) {
      return res.redirect('/dashboard');
    }
    req.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication verification failed'));
  }
};

module.exports = { isAuthenticated, isAdmin };