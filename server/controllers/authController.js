const { getDeviceInfo } = require("../utils/deviceInfo");
const User = require("../models/User");
const Token = require("../models/Token");
const VerificationToken = require("../models/VerificationToken");
const jwt = require("jsonwebtoken");
const {
	generateAccessToken,
	generateRefreshToken,
	generateVerificationToken,
	generateResetToken,
} = require("../utils/generateTokens");

const {
	sendVerificationEmail,
	sendResetPasswordEmail,
	sendEmailChangeVerification,  // ✅ THÊM DÒNG NÀY
} = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// ============ ĐĂNG KÝ ============
const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu!",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Mật khẩu phải có ít nhất 6 ký tự!",
			});
		}

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				message: "Email đã được đăng ký!",
			});
		}

		// Tạo user mới (chưa xác thực)
		const user = await User.create({
			name,
			email,
			password,
			isVerified: false,
		});

		// Tạo verification token
		const verifyToken = generateVerificationToken();
		await VerificationToken.create({
			userId: user._id,
			token: verifyToken,
			type: "verify",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 giờ
		});

		// Gửi email xác thực
		await sendVerificationEmail(email, name, verifyToken);

		res.status(201).json({
			success: true,
			message:
				"Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ XÁC THỰC EMAIL ============
const verifyEmail = async (req, res) => {
	try {
		const { token } = req.body;

		const verificationToken = await VerificationToken.findOne({
			token,
			type: "verify",
			expiresAt: { $gt: new Date() },
		});

		if (!verificationToken) {
			return res.status(400).json({
				success: false,
				message: "Token xác thực không hợp lệ hoặc đã hết hạn!",
			});
		}

		const user = await User.findById(verificationToken.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		user.isVerified = true;
		await user.save();

		await VerificationToken.deleteOne({ _id: verificationToken._id });

		res.json({
			success: true,
			message: "Xác thực email thành công! Bạn có thể đăng nhập.",
		});
	} catch (error) {
		console.error("Verify email error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ ĐĂNG NHẬP ============
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập email và mật khẩu!",
			});
		}

		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng!",
			});
		}

		const isPasswordMatch = await user.matchPassword(password);
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng!",
			});
		}

		if (!user.isVerified) {
			return res.status(403).json({
				success: false,
				message: "Vui lòng xác thực email trước khi đăng nhập!",
			});
		}

		// ✅ LẤY THÔNG TIN THIẾT BỊ
		const userAgent = req.headers["user-agent"] || "";
		const platform = req.headers["sec-ch-ua-platform"] || "";
		const ipAddress =
			req.ip ||
			req.headers["x-forwarded-for"] ||
			req.socket.remoteAddress ||
			"";

		const { deviceType, browser, deviceName } = getDeviceInfo(
			userAgent,
			platform,
		);

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		// ✅ LƯU TOKEN KÈM THÔNG TIN THIẾT BỊ
		await Token.create({
			userId: user._id,
			token: refreshToken,
			deviceName: deviceName,
			deviceType: deviceType,
			browser: browser,
			ipAddress: ipAddress,
			lastActive: new Date(),
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		});

		let rank = "MEMBER";
		if (user.points >= 1000) rank = "DIAMOND";
		else if (user.points >= 500) rank = "GOLD";
		else if (user.points >= 100) rank = "SILVER";

		res.json({
			success: true,
			message: "Đăng nhập thành công!",
			data: {
				accessToken,
				refreshToken,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: rank,
					role: user.role,
					isVerified: user.isVerified,
				},
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ REFRESH TOKEN ============
const refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: "Không tìm thấy refresh token!",
			});
		}

		const tokenDoc = await Token.findOne({ token: refreshToken });
		if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
			return res.status(401).json({
				success: false,
				message: "Refresh token không hợp lệ hoặc đã hết hạn!",
			});
		}

		let decoded;
		try {
			decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: "Refresh token không hợp lệ!",
			});
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Người dùng không tồn tại!",
			});
		}

		const accessToken = generateAccessToken(user);

		res.json({
			success: true,
			accessToken,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ QUÊN MẬT KHẨU ============
const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.json({
				success: true,
				message:
					"Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
			});
		}

		const resetToken = generateResetToken();

		await VerificationToken.findOneAndDelete({
			userId: user._id,
			type: "reset",
		});

		await VerificationToken.create({
			userId: user._id,
			token: resetToken,
			type: "reset",
			expiresAt: new Date(Date.now() + 60 * 60 * 1000),
		});

		await sendResetPasswordEmail(email, user.name, resetToken);

		res.json({
			success: true,
			message:
				"Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ ĐẶT LẠI MẬT KHẨU ============
const resetPassword = async (req, res) => {
	try {
		const { token, password } = req.body;

		const resetToken = await VerificationToken.findOne({
			token,
			type: "reset",
			expiresAt: { $gt: new Date() },
		});

		if (!resetToken) {
			return res.status(400).json({
				success: false,
				message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!",
			});
		}

		const user = await User.findById(resetToken.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(password, salt);
		await user.save();

		// Xóa tất cả refresh tokens
		await Token.deleteMany({ userId: user._id });
		await VerificationToken.deleteOne({ _id: resetToken._id });

		res.json({
			success: true,
			message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ ĐĂNG XUẤT ============
const logout = async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (refreshToken) {
			await Token.findOneAndDelete({ token: refreshToken });
		}
		res.json({
			success: true,
			message: "Đăng xuất thành công!",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ ĐĂNG XUẤT TẤT CẢ THIẾT BỊ ============
const logoutAllDevices = async (req, res) => {
	try {
		await Token.deleteMany({ userId: req.user.id });
		res.json({
			success: true,
			message: "Đã đăng xuất khỏi tất cả thiết bị!",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ ĐỔI MẬT KHẨU ============
const changePassword = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;

		if (!oldPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới!",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
			});
		}

		const user = await User.findById(req.user.id).select("+password");
		const isMatch = await user.matchPassword(oldPassword);

		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Mật khẩu cũ không đúng!",
			});
		}

		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(newPassword, salt);
		await user.save();

		// Xóa tất cả refresh tokens
		await Token.deleteMany({ userId: user._id });

		res.json({
			success: true,
			message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ LẤY PROFILE ============
const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		let rank = "MEMBER";
		if (user.points >= 1000) rank = "DIAMOND";
		else if (user.points >= 500) rank = "GOLD";
		else if (user.points >= 100) rank = "SILVER";

		res.json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: rank,
					role: user.role,
					isVerified: user.isVerified,
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ CẬP NHẬT PROFILE ============
const updateProfile = async (req, res) => {
	try {
		const { name, email } = req.body;
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		if (name) user.name = name;
		if (email) user.email = email;

		await user.save();

		res.json({
			success: true,
			message: "Cập nhật thông tin thành công!",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: user.rank,
					role: user.role,
				},
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ LẤY ĐIỂM ============
const getPoints = async (req, res) => {
	try {
		res.json({
			success: true,
			data: {
				points: req.user.points,
				rank: req.user.rank,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ TẠO ADMIN (CHỈ 1 LẦN) ============
const createAdmin = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập đầy đủ thông tin!",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Mật khẩu phải có ít nhất 6 ký tự!",
			});
		}

		const existingAdmin = await User.findOne({ role: "admin" });
		if (existingAdmin) {
			return res.status(403).json({
				success: false,
				message: "Admin đã tồn tại!",
			});
		}

		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				message: "Email đã được đăng ký!",
			});
		}

		const admin = await User.create({
			name,
			email,
			password,
			role: "admin",
			points: 0,
			rank: "DIAMOND",
			isVerified: true,
		});

		const accessToken = generateAccessToken(admin);
		const refreshToken = generateRefreshToken(admin);

		await Token.create({
			userId: admin._id,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		});

		res.status(201).json({
			success: true,
			message: "Tạo tài khoản admin thành công!",
			data: {
				accessToken,
				refreshToken,
				user: {
					id: admin._id,
					name: admin.name,
					email: admin.email,
					points: admin.points,
					rank: admin.rank,
					role: admin.role,
				},
			},
		});
	} catch (error) {
		console.error("CreateAdmin error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ LẤY DANH SÁCH THIẾT BỊ ĐANG ĐĂNG NHẬP ============
const getDevices = async (req, res) => {
	try {
		const devices = await Token.find({
			userId: req.user.id,
			expiresAt: { $gt: new Date() },
		}).sort({ lastActive: -1 });

		// Lấy token hiện tại để đánh dấu thiết bị đang dùng
		const currentToken = req.headers.authorization?.split(" ")[1];
		const currentDevice = await Token.findOne({ token: currentToken });

		const formattedDevices = devices.map((device) => ({
			id: device._id,
			deviceName: device.deviceName,
			deviceType: device.deviceType,
			browser: device.browser,
			ipAddress: device.ipAddress,
			lastActive: device.lastActive,
			createdAt: device.createdAt,
			isCurrentDevice: currentDevice?._id.toString() === device._id.toString(),
		}));

		res.json({
			success: true,
			data: formattedDevices,
			count: formattedDevices.length,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ THU HỒI THIẾT BỊ (ĐĂNG XUẤT TỪ XA) ============
const revokeDevice = async (req, res) => {
	try {
		const { deviceId } = req.params;

		const token = await Token.findOne({
			_id: deviceId,
			userId: req.user.id,
		});

		if (!token) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy thiết bị!",
			});
		}

		// Không cho thu hồi thiết bị hiện tại
		const currentToken = req.headers.authorization?.split(" ")[1];
		if (token.token === currentToken) {
			return res.status(400).json({
				success: false,
				message: "Không thể thu hồi thiết bị đang dùng!",
			});
		}

		await Token.findByIdAndDelete(deviceId);

		res.json({
			success: true,
			message: "Đã thu hồi thiết bị thành công!",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ GỬI LẠI EMAIL XÁC THỰC ============
const resendVerificationEmail = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập email!",
			});
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng với email này!",
			});
		}

		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: "Tài khoản đã được xác thực! Bạn có thể đăng nhập.",
			});
		}

		// Xóa token cũ (nếu có)
		await VerificationToken.deleteMany({
			userId: user._id,
			type: "verify",
		});

		// Tạo token mới
		const verifyToken = generateVerificationToken();
		await VerificationToken.create({
			userId: user._id,
			token: verifyToken,
			type: "verify",
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 giờ
		});

		// Gửi email xác thực mới
		await sendVerificationEmail(email, user.name, verifyToken);

		res.json({
			success: true,
			message:
				"Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư (cả spam).",
		});
	} catch (error) {
		console.error("Resend verification error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ============ YÊU CẦU ĐỔI EMAIL ============
const requestEmailChange = async (req, res) => {
	try {
		const { newEmail, currentEmail } = req.body;
		const userId = req.user.id;

		// Kiểm tra email mới đã tồn tại chưa
		const existingUser = await User.findOne({ email: newEmail });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "Email mới đã được đăng ký bởi tài khoản khác!",
			});
		}

		// Tạo token xác thực
		const verifyToken = generateVerificationToken();

		// Lưu token vào database hoặc cache
		await VerificationToken.create({
			userId,
			token: verifyToken,
			type: "email_change",
			newEmail: newEmail,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 giờ
		});

		// Gửi email xác thực
		await sendEmailChangeVerification(newEmail, req.user.name, verifyToken);

		res.json({
			success: true,
			message:
				"Đã gửi email xác thực đến địa chỉ email mới. Vui lòng kiểm tra và xác nhận.",
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// ============ XÁC NHẬN ĐỔI EMAIL ============
const verifyEmailChange = async (req, res) => {
	try {
		const { token } = req.body;

		const verificationToken = await VerificationToken.findOne({
			token,
			type: "email_change",
			expiresAt: { $gt: new Date() },
		});

		if (!verificationToken) {
			return res.status(400).json({
				success: false,
				message: "Token xác thực không hợp lệ hoặc đã hết hạn!",
			});
		}

		const user = await User.findById(verificationToken.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		// Cập nhật email mới
		user.email = verificationToken.newEmail;
		await user.save();

		// Xóa token
		await VerificationToken.deleteOne({ _id: verificationToken._id });

		res.json({
			success: true,
			message: "Đổi email thành công! Vui lòng đăng nhập lại.",
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
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
};
