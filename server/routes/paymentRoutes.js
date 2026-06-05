const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả route đều cần xác thực
router.post('/create', verifyToken, paymentController.createPayment);
router.post('/execute', verifyToken, paymentController.executePayment);
router.post('/update-status', verifyToken, paymentController.updatePaymentStatus);

module.exports = router;