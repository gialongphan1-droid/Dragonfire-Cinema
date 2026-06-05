const express = require("express");
const router = express.Router();
const {
	register,
	verifyEmail,
	login,
	refreshToken,
	forgotPassword,
	resetPassword,
	logout,
	logoutAllDevices,
	changePassword,
	getProfile,
	updateProfile,
	getPoints,
	createAdmin,
	getDevices,
	revokeDevice,
	resendVerificationEmail,
	requestEmailChange,
	verifyEmailChange,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
	loginLimiter,
	registerLimiter,
	forgotPasswordLimiter,
} = require("../middlewares/rateLimiter");

// ============ PUBLIC ROUTES (Không cần token) ============

// Đăng ký (có rate limit)
router.post("/register", registerLimiter, register);

// Xác thực email
router.post("/verify-email", verifyEmail);

// Đăng nhập (có rate limit)
router.post("/login", loginLimiter, login);

// Refresh token (lấy access token mới)
router.post("/refresh-token", refreshToken);

// Quên mật khẩu (có rate limit)
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

// Đặt lại mật khẩu
router.post("/reset-password", resetPassword);

// Tạo admin (chỉ dùng 1 lần)
router.post("/create-admin", createAdmin);

// Gửi lại email xác thực
router.post("/resend-verification", resendVerificationEmail);

// ============ PROTECTED ROUTES (Cần token) ============

// Đăng xuất
router.post("/logout", verifyToken, logout);

// Đăng xuất tất cả thiết bị
router.post("/logout-all", verifyToken, logoutAllDevices);

// Đổi mật khẩu
router.post("/change-password", verifyToken, changePassword);

// Lấy profile
router.get("/profile", verifyToken, getProfile);

// Cập nhật profile
router.put("/profile", verifyToken, updateProfile);

// Lấy điểm thưởng
router.get("/points", verifyToken, getPoints);

// Quản lý thiết bị
router.get("/devices", verifyToken, getDevices);
router.delete("/devices/:deviceId", verifyToken, revokeDevice);

// Yêu cầu đổi email
router.post("/request-email-change", verifyToken, requestEmailChange);
router.post("/verify-email-change", verifyEmailChange);

module.exports = router;
