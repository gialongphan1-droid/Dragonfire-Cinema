const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const User = require("../models/User");

// Lấy danh sách ghế trống
const getAvailableSeats = async (req, res) => {
	try {
		const { showtimeId } = req.params;
		const showtime = await Showtime.findById(showtimeId).populate(
			"movieId",
			"title duration poster",
		);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu!" });
		}

		const occupiedSeats = showtime.seats
			.filter((seat) => seat.isBooked === true)
			.map((seat) => seat.seatNumber);
		const availableSeats = showtime.seats
			.filter((seat) => seat.isBooked === false)
			.map((seat) => seat.seatNumber);

		res.json({
			success: true,
			data: {
				showtime,
				occupiedSeats,
				availableSeats,
				totalSeats: showtime.seats.length,
				remainingSeats: availableSeats.length,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Tạo booking mới
const createBooking = async (req, res) => {
	try {
		const { showtimeId, seats, totalAmount, voucherCode, discountAmount } = req.body;
		const userId = req.user.id;

		console.log("📝 Tạo booking:", { showtimeId, seats, totalAmount, userId });

		// Kiểm tra showtime tồn tại
		const showtime = await Showtime.findById(showtimeId);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu!" });
		}

		// Kiểm tra ghế còn trống
		const bookedSeats = [];
		for (const seat of seats) {
			const existingSeat = showtime.seats.find(
				(s) => s.seatNumber === seat && s.isBooked === true
			);
			if (existingSeat) {
				bookedSeats.push(seat);
			}
		}

		if (bookedSeats.length > 0) {
			return res.status(400).json({
				success: false,
				message: `Ghế ${bookedSeats.join(", ")} đã được đặt!`,
			});
		}

		// Tạo mã vé ngẫu nhiên
		const ticketCode = `VÉ${Date.now()}${Math.floor(Math.random() * 1000)}`;

		// Tạo booking mới
		const booking = new Booking({
			bookingCode: ticketCode,
			userId: userId,
			showtimeId: showtimeId,
			seats: seats,
			totalAmount: totalAmount,
			status: "pending",
			paymentStatus: "unpaid",
			expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
		});

		await booking.save();

		// Cập nhật ghế đã đặt trong showtime
		for (const seat of seats) {
			const seatToBook = showtime.seats.find((s) => s.seatNumber === seat);
			if (seatToBook) {
				seatToBook.isBooked = true;
			}
		}
		await showtime.save();

		// Cập nhật điểm thưởng (nếu totalAmount > 0)
		let pointsEarned = 0;
		if (totalAmount > 0) {
			pointsEarned = Math.floor(totalAmount / 1000);
			await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
		}

		console.log("✅ Tạo booking thành công:", booking._id);

		res.status(201).json({
			success: true,
			message: "Đặt vé thành công!",
			data: {
				bookingId: booking._id,
				ticketCode: ticketCode,
				expiresAt: booking.expiresAt,
				finalAmount: totalAmount,
				pointsEarned: pointsEarned,
			},
		});
	} catch (error) {
		console.error("❌ Lỗi tạo booking:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy danh sách booking của user
const getMyBookings = async (req, res) => {
	try {
		const isAdmin = req.user.role === "admin";
		let bookings;

		if (isAdmin) {
			bookings = await Booking.find()
				.populate({
					path: "showtimeId",
					populate: { path: "movieId", select: "title poster" },
				})
				.populate("userId", "name email")
				.sort({ createdAt: -1 });
		} else {
			bookings = await Booking.find({ userId: req.user.id })
				.populate({
					path: "showtimeId",
					populate: { path: "movieId", select: "title poster" },
				})
				.sort({ createdAt: -1 });
		}

		res.json({ success: true, data: bookings });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Hủy booking
const cancelBooking = async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.bookingId);
		if (!booking) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy booking!" });
		}

		const isAdmin = req.user.role === "admin";
		const isOwner = booking.userId.toString() === req.user.id;

		if (!isAdmin && !isOwner) {
			return res
				.status(403)
				.json({ success: false, message: "Bạn không có quyền hủy vé này!" });
		}

		if (booking.status !== "pending") {
			return res
				.status(400)
				.json({ success: false, message: "Không thể hủy booking này!" });
		}

		// Giải phóng ghế
		const showtime = await Showtime.findById(booking.showtimeId);
		if (showtime) {
			for (const seatName of booking.seats) {
				const seat = showtime.seats.find((s) => s.seatNumber === seatName);
				if (seat) seat.isBooked = false;
			}
			await showtime.save();
		}

		booking.status = "cancelled";
		await booking.save();

		res.json({ success: true, message: "Hủy đặt vé thành công!" });
	} catch (error) {
		console.error("Cancel booking error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy danh sách ghế đã đặt theo showtimeId
const getOccupiedSeatsByShowtime = async (req, res) => {
	try {
		const { showtimeId } = req.params;
		
		const showtime = await Showtime.findById(showtimeId);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu!" });
		}

		const occupiedSeats = showtime.seats
			.filter((seat) => seat.isBooked === true)
			.map((seat) => seat.seatNumber);

		res.json({
			success: true,
			data: {
				occupiedSeats: occupiedSeats,
				totalSeats: showtime.seats.length,
				remainingSeats: showtime.seats.length - occupiedSeats.length,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getAvailableSeats,
	createBooking,
	getMyBookings,
	cancelBooking,
	getOccupiedSeatsByShowtime,
};