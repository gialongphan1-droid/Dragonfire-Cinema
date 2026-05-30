const jwt = require("jsonwebtoken");

// Hàm kiểm tra xem người dùng đã đăng nhập (gửi kèm Token hợp lệ) chưa
const verifyToken = (req, res, next) => {
	const authHeader = req.header("Authorization");
	const token = authHeader && authHeader.split(" ")[1]; // Lấy chuỗi sau chữ 'Bearer '

	if (!token)
		return res
			.status(401)
			.json({
				success: false,
				message: "Từ chối truy cập! Thiếu Token xác thực.",
			});

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified; // Gán thông tin giải mã (id, role) vào biến req.user
		next(); // Cho phép đi tiếp vào API xử lý dữ liệu
	} catch (err) {
		res
			.status(403)
			.json({ success: false, message: "Token đã hết hạn hoặc không hợp lệ!" });
	}
};

// Hàm chặn quyền: Chỉ cho phép tài khoản Admin đi qua
const verifyAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.role === "admin") {
			next();
		} else {
			res
				.status(403)
				.json({
					success: false,
					message: "Quyền truy cập bị từ chối! Bạn không phải Admin.",
				});
		}
	});
};

module.exports = { verifyToken, verifyAdmin };
