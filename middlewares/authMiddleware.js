// middlewares/authMiddleware.js – Authentication and admin-check middleware
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  else return res.redirect('/api/auth/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  else return res.status(403).json({ error: 'Admin access required' });
};
