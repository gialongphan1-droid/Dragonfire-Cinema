const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db"); // Import hàm kết nối mới

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

// MIDDLEWARES CẤU HÌNH HỆ THỐNG (Bắt buộc nằm TRƯỚC Routes)
app.use(express.json());
app.use(cors());

// KHAI BÁO TIỀN TỐ ĐƯỜNG DẪN (URL) CHO TỪNG MODULE
app.use("/api/auth", authRoutes); // <-- Phần của Long Phan
app.use("/api/bookings", bookingRoutes); // <-- Phần của Hiếu
app.use("/api/movies", movieRoutes); // <-- Phần của Lê Long
app.use("/api/payments", paymentRoutes); // <-- Phần của Đạt
app.use("/api/products", productRoutes); // <-- Phần của Kỷ
app.use("/api/showtimes", showtimeRoutes); // <-- Phần của Hoàng

// Cấu hình trang test nhanh khi vào http://localhost:5000/
app.get("/", (req, res) => {
	res.send("🚀 Server Dragonfire Cinema đang chạy mượt mà!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});
