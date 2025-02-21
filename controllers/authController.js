// controllers/authController.js – Handles login/logout and registration
const User = require('../models/User');

exports.loginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.validatePassword(password))) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.redirect('/');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/api/auth/login');
};

// (Optional) Registration function for new users – ensure admin-only access in production.
exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const newUser = await User.create({ username, passwordHash: password, role });
    res.json({ message: 'User registered', user: newUser });
  } catch (err) {
    next(err);
  }
};
