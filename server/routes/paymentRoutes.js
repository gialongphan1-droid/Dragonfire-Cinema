const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route 1 của Đạt đã có sẵn:
router.post('/create', paymentController.createPayment);

// THÊM ROUTE NÀY VÀO ĐỂ XỬ LÝ CHỐT ĐƠN + GỬI MAIL:
router.post('/execute', paymentController.executePayment);

module.exports = router;
