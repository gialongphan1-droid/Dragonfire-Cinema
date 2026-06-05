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

// Tạo booking mới
const createBooking = async (req, res) => {
	try {
		let { showtimeId, seats, totalAmount, voucherCode, discountAmount } =
			req.body;
		const userId = req.user.id;
		const isAdmin = req.user.role === "admin";

		if (!showtimeId || !seats || seats.length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng chọn ghế!" });
		}

		const showtime = await Showtime.findById(showtimeId);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Suất chiếu không tồn tại!" });
		}

		// Kiểm tra ghế đã được đặt chưa
		const alreadyBooked = seats.filter((seatName) => {
			const seat = showtime.seats.find((s) => s.seatNumber === seatName);
			return seat && seat.isBooked === true;
		});

		if (alreadyBooked.length > 0 && !isAdmin) {
			return res.status(400).json({
				success: false,
				message: `Ghế ${alreadyBooked.join(", ")} đã được đặt!`,
			});
		}

		// Kiểm tra pending booking
		if (!isAdmin) {
			const existingPending = await Booking.findOne({
				userId,
				showtimeId,
				status: "pending",
				expiresAt: { $gt: new Date() },
			});
			if (existingPending) {
				return res.status(400).json({
					success: false,
					message:
						"Bạn đã có một đơn đặt vé đang chờ thanh toán cho suất chiếu này!",
				});
			}
		}

		// Tính toán khuyến mãi
		let finalAmount = totalAmount || seats.length * (showtime.price || 90000);
		let appliedDiscountAmount = discountAmount || 0;
		let discountType = voucherCode ? "voucher" : null;
		let promotionMessage = "";

		const isFirst = await isFirstBooking(userId);
		if (isFirst && !voucherCode) {
			appliedDiscountAmount = finalAmount * 0.2;
			discountType = "first_booking";
			finalAmount = finalAmount - appliedDiscountAmount;
			promotionMessage =
				"Chào mừng thành viên mới! Bạn được giảm 20% cho vé đầu tiên.";
		}

		const { isWeekendCombo, freeSeats } = checkWeekendCombo(
			showtime.startTime,
			seats.length,
		);
		if (isWeekendCombo && !isFirst && !voucherCode) {
			const discountedPrice =
				(seats.length - freeSeats) * (showtime.price || 90000);
			appliedDiscountAmount = finalAmount - discountedPrice;
			finalAmount = discountedPrice;
			discountType = "weekend_combo";
			promotionMessage = `Combo cuối tuần! Mua ${seats.length} tặng ${freeSeats} vé.`;
		}

		if (finalAmount < 0) finalAmount = 0;

		const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();
		const expiresAt = isAdmin ? null : new Date(Date.now() + 5 * 60 * 1000);

		// Cập nhật isBooked trong showtime
		for (const seatName of seats) {
			const seat = showtime.seats.find((s) => s.seatNumber === seatName);
			if (seat) seat.isBooked = true;
		}
		await showtime.save();

		const booking = new Booking({
			bookingCode: ticketCode,
			userId,
			showtimeId,
			seats,
			customerName: req.user.name || "Khách",
			customerPhone: req.body.customerPhone || "",
			customerEmail: req.user.email || "",
			totalPrice: finalAmount,
			totalAmount: finalAmount,
			originalAmount: totalAmount,
			discountAmount: appliedDiscountAmount,
			discountType,
			voucherCode: voucherCode || null,
			status: "pending",
			ticketCode,
			expiresAt,
		});

		await booking.save();

		const pointsEarned = await updateUserPoints(userId, finalAmount);

		res.status(201).json({
			success: true,
			message:
				promotionMessage ||
				(isAdmin
					? "Admin đặt vé thành công!"
					: "Đặt vé thành công! Vui lòng thanh toán trong 5 phút."),
			data: {
				bookingId: booking._id,
				ticketCode,
				originalAmount: totalAmount,
				finalAmount,
				discountAmount: appliedDiscountAmount,
				pointsEarned,
				expiresAt,
			},
		});
	} catch (error) {
		console.error("Create booking error:", error);
		res.status(500).json({ success: false, message: error.message });
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
