const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const User = require("../models/User");

// Kiểm tra lần đặt vé đầu tiên
const isFirstBooking = async (userId) => {
	const bookingCount = await Booking.countDocuments({
		userId,
		status: { $in: ["pending", "completed"] },
	});
	return bookingCount === 0;
};

// Kiểm tra combo cuối tuần (mua 2 tặng 1)
const checkWeekendCombo = (date, seatCount) => {
	const dayOfWeek = new Date(date).getDay();
	const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
	if (isWeekend && seatCount >= 2) {
		const freeSeats = Math.floor(seatCount / 2);
		return { isWeekendCombo: true, freeSeats };
	}
	return { isWeekendCombo: false, freeSeats: 0 };
};

// Cập nhật điểm thưởng
const updateUserPoints = async (userId, totalPrice) => {
	const pointsEarned = Math.floor(totalPrice / 1000);
	await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
	return pointsEarned;
};

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

		// Lấy từ showtime.seats
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

// Sau khi tạo booking thành công, cập nhật số ghế còn lại
const createBooking = async (req, res) => {
	try {
		// ... code tạo booking hiện tại ...

		// SAU KHI LƯU BOOKING THÀNH CÔNG, CẬP NHẬT SHOWTIME
		// Cập nhật số ghế đã đặt cho showtime
		const showtime = await Showtime.findById(showtimeId);
		if (showtime) {
			// Thêm các ghế đã đặt vào danh sách bookedSeats
			for (const seat of seats) {
				if (!showtime.bookedSeats.includes(`${seat.row}${seat.number}`)) {
					showtime.bookedSeats.push(`${seat.row}${seat.number}`);
				}
			}
			// Cập nhật remainingSeats
			showtime.remainingSeats =
				showtime.totalSeats - showtime.bookedSeats.length;
			await showtime.save();
		}

		res.status(201).json(booking);
	} catch (error) {
		// ...
	}
};

// Lấy danh sách booking
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

module.exports = {
	getAvailableSeats,
	createBooking,
	getMyBookings,
	cancelBooking,
};
