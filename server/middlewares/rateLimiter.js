const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: {
		success: false,
		message: "Quá nhiều lần đăng nhập! Thử lại sau 15 phút.",
	},
});

const registerLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 10,
	message: {
		success: false,
		message: "Quá nhiều yêu cầu đăng ký! Thử lại sau 1 giờ.",
	},
});

const forgotPasswordLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 3,
	message: { success: false, message: "Quá nhiều yêu cầu! Thử lại sau 1 giờ." },
});

module.exports = { loginLimiter, registerLimiter, forgotPasswordLimiter };
