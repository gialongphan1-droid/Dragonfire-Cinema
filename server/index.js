const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware cấu hình chuẩn để đọc dữ liệu JSON gửi lên từ Client
app.use(express.json());
app.use(cors());

// =========================================================
// 1. IMPORT CÁC TUYẾN ĐƯỜNG API CỦA THÀNH VIÊN (Kéo 5 file routes vào)
// =========================================================
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// =========================================================
// 2. PHÂN CỔNG URL RIÊNG BIỆT (Mở đường sẵn cho từng người code độc lập)
// =========================================================
app.use("/api/auth", authRoutes); // Luồng xử lý của Long Phan (Đăng nhập, điểm thưởng)
app.use("/api/products", productRoutes); // Luồng xử lý của Kỷ (Bắp nước, combo)
app.use("/api/movies", movieRoutes); // Luồng xử lý của Lê Long (Tìm kiếm, duyệt phim)
app.use("/api/showtimes", showtimeRoutes); // Luồng xử lý của Hoàng (Lịch chiếu, phòng)
app.use("/api/bookings", bookingRoutes); // Luồng xử lý của Hiếu & Đạt (Đặt vé, thanh toán)

// =========================================================
// 3. KẾT NỐI DATABASE MONGODB ATLAS CLOUD
// =========================================================
const PORT = process.env.PORT || 5000;
mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log("🎉 Kết nối thành công tới MongoDB Atlas!"))
	.catch((err) =>
		console.error(
			"❌ Lỗi kết nối Database rồi Lead ơi, kiểm tra lại file .env:",
			err,
		),
	);

// Khởi chạy server
app.listen(PORT, () => {
	console.log(`🚀 Server đang chạy mượt mà tại cổng ${PORT}`);
	console.log(
		`💡 Các thành viên có thể test API mẫu tại link: http://localhost:5000/api/<tên_module>/test`,
	);
});
