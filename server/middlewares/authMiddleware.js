const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Token không hợp lệ hoặc người dùng không tồn tại!",
			});
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				message: "Token đã hết hạn! Vui lòng đăng nhập lại.",
				code: "TOKEN_EXPIRED",
			});
		}
		return res.status(401).json({
			success: false,
			message: "Token không hợp lệ!",
		});
	}
};

const isAdmin = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Bạn chưa đăng nhập!",
			});
		}

		if (req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message:
					"Bạn không có quyền thực hiện hành động này! Chỉ Admin mới được phép.",
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi phân quyền: " + error.message,
		});
	}
};

// ✅ MIDDLEWARE KIỂM TRA EMAIL ĐÃ XÁC THỰC CHƯA
const isVerified = async (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Bạn chưa đăng nhập!",
			});
		}

		if (!req.user.isVerified) {
			return res.status(403).json({
				success: false,
				message: "Vui lòng xác thực email trước khi thực hiện hành động này!",
				code: "EMAIL_NOT_VERIFIED",
			});
		}

		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Lỗi kiểm tra xác thực: " + error.message,
		});
	}
};

module.exports = {
	verifyToken,
	isAdmin,
	isVerified,
};
