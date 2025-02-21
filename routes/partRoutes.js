// routes/partRoutes.js – Endpoints for parts management
const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/', partController.getAllParts);
router.post('/', isAdmin, partController.createPart);
router.put('/:id', isAdmin, partController.updatePart);
router.delete('/:id', isAdmin, partController.deletePart);

module.exports = router;

