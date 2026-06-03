const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

// Connect to database
const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Movie routes
const movieRoutes = require("./routes/movieRoutes");
app.use("/api/movies", movieRoutes);
// lịch chiếu 
const showtimeRoutes = require("./routes/showtimeRoutes");
app.use("/api/showtimes", showtimeRoutes);
// dặt vé
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

// Showtime routes
const showtimeRoutes = require("./routes/showtimeRoutes");
app.use("/api/showtimes", showtimeRoutes);

// ✅ THÊM ROOM ROUTES VÀO ĐÂY
const roomRoutes = require("./routes/roomRoutes");
app.use("/api/rooms", roomRoutes);

// Test route
app.get("/api/test", (req, res) => {
	res.json({ message: "API đang hoạt động!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "Có lỗi xảy ra từ server!",
	});
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server đang chạy tại http://localhost:${PORT}`);
});