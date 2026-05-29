const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware cấu hình chuẩn để đọc dữ liệu JSON gửi lên từ Client
app.use(express.json());
app.use(cors());

// Route kiểm tra trạng thái Server hoạt động (Bổ sung để test nhanh không cần qua module)
app.get("/", (req, res) => {
	res.json({ message: "🚀 Dragonfire Cinema API đang hoạt động ổn định!" });
});

// =========================================================
// 1. IMPORT CÁC TUYẾN ĐƯỜNG API CỦA THÀNH VIÊN
// =========================================================
// LƯU Ý CHO TEAM: Các file route bắt buộc phải có "module.exports = router;" ở cuối file để không bị lỗi crash server.
const authRoutes = require("./routes/authRoutes"); // Long Phan
const productRoutes = require("./routes/productRoutes"); // Kỷ
const movieRoutes = require("./routes/movieRoutes"); // Lê Long
const showtimeRoutes = require("./routes/showtimeRoutes"); // Hoàng
const bookingRoutes = require("./routes/bookingRoutes"); // Hiếu
const paymentRoutes = require("./routes/paymentRoutes"); // Đạt (Tách riêng ra để Đạt chủ động file code)

// =========================================================
// 2. PHÂN CỔNG URL RIÊNG BIỆT (Đường dẫn riêng cho từng người)
// =========================================================
app.use("/api/auth", authRoutes); // Luồng xử lý của Long Phan (Đăng nhập, phân hạng, tích điểm)
app.use("/api/products", productRoutes); // Luồng xử lý của Kỷ (Combo bắp nước)
app.use("/api/movies", movieRoutes); // Luồng xử lý của Lê Long (Quản lý phim, Tìm kiếm, Duyệt phim)
app.use("/api/showtimes", showtimeRoutes); // Luồng xử lý của Hoàng (Lịch chiếu, cấu hình phòng chiếu)
app.use("/api/bookings", bookingRoutes); // Luồng xử lý của Hiếu (Giữ ghế, đặt vé)
app.use("/api/payments", paymentRoutes); // Luồng xử lý của Đạt (Tích hợp cổng MoMo/VNPAY, xuất vé QR)

// =========================================================
// 3. KẾT NỐI DATABASE MONGODB ATLAS CLOUD
// =========================================================
const PORT = process.env.PORT || 5000;

// Thêm cấu hình mượt mà cho mongoose
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("🎉 Kết nối thành công tới MongoDB Atlas!"))
	.catch((err) => {
		console.error("❌ Lỗi kết nối Database rồi Lead ơi! Kiểm tra lại:");
		console.error("- File .env đã có biến MONGO_URI chưa?");
		console.error(
			"- Đã mở quyền IP (Allow Access From Anywhere) trên MongoDB Atlas chưa?",
		);
		console.error("Chi tiết lỗi:", err.message);
	});

// Khởi chạy server
app.listen(PORT, () => {
	console.log(`\n========================================================`);
	console.log(`🚀 Server đang chạy mượt mà tại cổng: http://localhost:${PORT}`);
	console.log(`💡 Kiểm tra trạng thái server tại: http://localhost:${PORT}/`);
	console.log(`========================================================\n`);
});
