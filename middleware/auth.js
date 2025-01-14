const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/auth/admin/login');
  }
};

module.exports = { isAdmin };