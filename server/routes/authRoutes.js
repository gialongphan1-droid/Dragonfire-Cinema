const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authMiddleware");

// =========================================================
// [POST] http://localhost:5000/api/auth/register -> ĐĂNG KÝ
// =========================================================
router.post("/register", async (req, res) => {
	try {
		// Phòng chống Injection: Ép kiểu dữ liệu đầu vào bắt buộc là chuỗi (String)
		const name = String(req.body.name || "").trim();
		const email = String(req.body.email || "").trim();
		const password = String(req.body.password || "");

		if (!name || !email || !password) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
		}

		// 1. Kiểm tra tài khoản trùng
		let user = await User.findOne({ email });
		if (user)
			return res
				.status(400)
				.json({ success: false, message: "Email này đã được sử dụng!" });

		// 2. Tạo User mới (Mặc định role: "user" theo cấu hình Model)
		user = new User({ name, email, password });

		// 3. Mã hóa mật khẩu trước khi lưu
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(password, salt);

		await user.save();
		res.status(201).json({ success: true, message: "Đăng ký thành công!" });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// =========================================================
// [POST] http://localhost:5000/api/auth/login -> ĐĂNG NHẬP & CẤP JWT TOKEN
// =========================================================
router.post("/login", async (req, res) => {
	try {
		// PHÒNG CHỐNG NOSQL INJECTION: Ép kiểu đầu vào thành chuỗi thuần túy.
		// Nếu hacker gửi {"$ne": ""}, nó sẽ bị biến thành chuỗi '{"$ne": ""}' và không thể thao túng câu lệnh MongoDB.
		const email = String(req.body.email || "").trim();
		const password = String(req.body.password || "");

		if (!email || !password) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng nhập email và mật khẩu!" });
		}

		// 1. Kiểm tra User tồn tại không
		const user = await User.findOne({ email });
		if (!user)
			return res.status(400).json({
				success: false,
				message: "Email hoặc mật khẩu không chính xác!",
			});

		// 2. Kiểm tra mật khẩu khớp không
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({
				success: false,
				message: "Email hoặc mật khẩu không chính xác!",
			});

		// 3. TẠO JWT TOKEN: Gom ID và Quyền (Role) của user vào token, thời hạn 1 ngày
		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1d" },
		);

		// 4. Trả về cho Client lưu trữ
		res.json({
			success: true,
			message: "Đăng nhập thành công!",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				rank: user.rank,
				points: user.points,
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

// =========================================================
// [GET] http://localhost:5000/api/auth/profile -> LẤY PROFILE
// =========================================================
router.get("/profile", verifyToken, async (req, res) => {
	try {
		// req.user được middleware verifyToken giải mã ra và gán vào
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy người dùng!" });
		}
		res.json({ success: true, user });
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
});

module.exports = router;
