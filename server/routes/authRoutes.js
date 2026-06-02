const express = require("express");
const router = express.Router();
const {
	register,
	login,
	getProfile,
	updateProfile,
	getPoints,
	createAdmin, // ✅ THÊM DÒNG NÀY
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Public routes (không cần token)
router.post("/register", register);
router.post("/login", login);
router.post("/create-admin", createAdmin); // ✅ THÊM DÒNG NÀY

// Protected routes (cần token)
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/points", verifyToken, getPoints);

module.exports = router;
