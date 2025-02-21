// routes/customerRoutes.js – Customer-related endpoints
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', isAdmin, customerController.deleteCustomer);

module.exports = router;
