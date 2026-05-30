const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/test", authController.testAuth); // Chỉ gọi hàm từ controller

module.exports = router;