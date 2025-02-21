// routes/authRoutes.js – Routes for authentication
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
// Uncomment below to enable registration (admin-only)
// router.post('/register', authController.register);

module.exports = router;
