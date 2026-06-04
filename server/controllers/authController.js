const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Tạo JWT token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "7d",
	});
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Kiểm tra dữ liệu đầu vào
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

		// Kiểm tra email đã tồn tại
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				message: "Email đã được đăng ký!",
			});
		}

		// Tạo user mới
		const user = await User.create({
			name,
			email,
			password,
		});

		// Tính rank dựa trên points
		let rank = "MEMBER";
		if (user.points >= 1000) rank = "DIAMOND";
		else if (user.points >= 500) rank = "GOLD";
		else if (user.points >= 100) rank = "SILVER";

		user.rank = rank;
		await user.save();

		res.status(201).json({
			success: true,
			message: "Đăng ký thành công!",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: user.rank,
				},
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server: " + error.message,
		});
	}
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Kiểm tra dữ liệu đầu vào
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập email và mật khẩu!",
			});
		}

		// Tìm user và lấy cả password (vì select: false)
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng!",
			});
		}

		// Kiểm tra mật khẩu
		const isPasswordMatch = await user.matchPassword(password);
		if (!isPasswordMatch) {
			return res.status(401).json({
				success: false,
				message: "Email hoặc mật khẩu không đúng!",
			});
		}

		// Tạo token
		const token = generateToken(user._id);

		// Tính lại rank
		let rank = "MEMBER";
		if (user.points >= 1000) rank = "DIAMOND";
		else if (user.points >= 500) rank = "GOLD";
		else if (user.points >= 100) rank = "SILVER";

		res.status(200).json({
			success: true,
			message: "Đăng nhập thành công!",
			data: {
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: rank,
					role: user.role || "user",
				},
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server: " + error.message,
		});
	}
};

// @desc    Lấy thông tin profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng!",
			});
		}

		// Tính lại rank
		let rank = "MEMBER";
		if (user.points >= 1000) rank = "DIAMOND";
		else if (user.points >= 500) rank = "GOLD";
		else if (user.points >= 100) rank = "SILVER";

		res.status(200).json({
			success: true,
			message: "Lấy thông tin thành công!",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: rank,
					role: user.role || "user",
				},
			},
		});
	} catch (error) {
		console.error("GetProfile error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server: " + error.message,
		});
	}
};

// @desc    Cập nhật profile
// @route   PUT /api/auth/profile
// @access  Private
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

		res.status(200).json({
			success: true,
			message: "Cập nhật thông tin thành công!",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					points: user.points,
					rank: user.rank,
					role: user.role || "user",
				},
			},
		});
	} catch (error) {
		console.error("UpdateProfile error:", error);
		res.status(500).json({
			success: false,
			message: "Lỗi server: " + error.message,
		});
	}
};

// @desc    Lấy điểm thưởng
// @route   GET /api/auth/points
// @access  Private
const getPoints = async (req, res) => {
	try {
		res.status(200).json({
			success: true,
			message: "Lấy điểm thành công!",
			data: {
				points: req.user.points,
				rank: req.user.rank,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Lỗi server: " + error.message,
		});
	}
};

// @desc    Tạo tài khoản admin (chỉ dùng 1 lần)
// @route   POST /api/auth/create-admin
// @access  Public
const createAdmin = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Kiểm tra dữ liệu đầu vào
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

		// Kiểm tra xem đã có admin nào chưa (chỉ cho tạo 1 admin duy nhất)
		const existingAdmin = await User.findOne({ role: "admin" });
		if (existingAdmin) {
			return res.status(403).json({
				success: false,
				message: "Admin đã tồn tại! Không thể tạo thêm admin.",
			});
		}

		// Kiểm tra email đã tồn tại
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({
				success: false,
				message: "Email đã được đăng ký!",
			});
		}

		// Tạo admin mới
		const admin = await User.create({
			name,
			email,
			password,
			role: "admin",
			points: 0,
			rank: "DIAMOND",
		});

		// Tạo token
		const token = generateToken(admin._id);

		res.status(201).json({
			success: true,
			message: "Tạo tài khoản admin thành công!",
			data: {
				token,
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
			message: "Lỗi server: " + error.message,
		});
	}
};

module.exports = {
	register,
	login,
	getProfile,
	updateProfile,
	getPoints,
	createAdmin,
};