const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
router.post('/checkout', paymentController.createPayment);
router.put('/update-status', paymentController.updatePaymentStatus);

module.exports = router;
