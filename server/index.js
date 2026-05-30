const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// IMPORT CÁC FILE ROUTES CỦA CÁC THÀNH VIÊN VÀO ĐÂY
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const movieRoutes = require("./routes/movieRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");

const app = express();

// Kết nối DB
connectDB();

// MIDDLEWARES CẤU HÌNH HỆ THỐNG
app.use(express.json());

// Giới hạn CORS chỉ cho phép duy nhất Frontend của nhóm truy cập
app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

// KHAI BÁO TIỀN TỐ ĐƯỜNG DẪN (URL) DẠNG SỐ ÍT NHẤT QUÁN
app.use("/api/auth", authRoutes); // Long Phan
app.use("/api/booking", bookingRoutes); // Hiếu
app.use("/api/movie", movieRoutes); // Lê Long
app.use("/api/payment", paymentRoutes); // Đạt
app.use("/api/product", productRoutes); // Kỷ
app.use("/api/showtime", showtimeRoutes); // Hoàng

// Cấu hình trang test nhanh khi vào http://localhost:5000/
app.get("/", (req, res) => {
	res.send("🚀 Server Dragonfire Cinema đang chạy mượt mà và bảo mật!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
