const express = require("express");
const router = express.Router();
const {
	getVouchers,
	createVoucher,
	updateVoucher,
	deleteVoucher,
	validateVoucher,
} = require("../controllers/voucherController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public routes (cần token)
router.post("/validate", verifyToken, validateVoucher);

// Admin routes (cần token + admin)
router.get("/", verifyToken, getVouchers);
router.post("/create", verifyToken, createVoucher);
router.put("/:id", verifyToken, updateVoucher);
router.delete("/:id", verifyToken, deleteVoucher);

module.exports = router;
