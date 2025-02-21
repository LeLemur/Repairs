// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize } = require('./config/database');
const winston = require('./utils/logger');

// Import your routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const partRoutes = require('./routes/partRoutes');
const userRoutes = require('./routes/userRoutes'); // new

const { isAuthenticated } = require('./middlewares/authMiddleware');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'this is a super secret key – change me!',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', isAuthenticated, customerRoutes);
app.use('/api/orders', isAuthenticated, orderRoutes);
app.use('/api/parts', isAuthenticated, partRoutes);
app.use('/api/users', isAuthenticated, userRoutes);  // new

// Main page
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/api/auth/login');
});

// Global error handler
app.use(errorHandler);

// Sync database and start server
sequelize.sync({ force: false }).then(async () => {
  // Optionally auto-create a default admin if not exists
  const User = require('./models/User');
  let adminUser = await User.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    await User.create({ username: 'admin', passwordHash: 'adminpass', role: 'admin' });
    winston.info('Default admin user created: admin/adminpass');
  }
  winston.info('Database synced.');
  const server = app.listen(PORT, () => {
    winston.info(`Server running on port ${PORT}`);
  });
  server.on('error', (err) => {
    winston.error(err);
    process.exit(1);
  });
}).catch(err => {
  winston.error('Unable to sync database:', err);
});
