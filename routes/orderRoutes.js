// routes/orderRoutes.js – Order and order line endpoints
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/', orderController.getAllOrders);
router.get('/search', orderController.searchOrders);
router.get('/date-range', orderController.listOrdersByDateRange);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', isAdmin, orderController.deleteOrder);

// Order line endpoints
router.post('/:id/lines', orderController.addOrderLine);
router.put('/:id/lines/:lineId', orderController.updateOrderLine);
router.delete('/:id/lines/:lineId', isAdmin, orderController.deleteOrderLine);

// Additional endpoints
router.get('/:id/total', orderController.calculateOrderTotal);
router.get('/:id/history', orderController.getOrderHistory);
router.post('/:id/pay', orderController.markOrderAsPaid);

module.exports = router;
