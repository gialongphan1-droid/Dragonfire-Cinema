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

// Cập nhật điểm thưởng (1 điểm = 1.000đ)
const updateUserPoints = async (userId, totalPrice) => {
	const pointsEarned = Math.floor(totalPrice / 1000);
	await User.findByIdAndUpdate(userId, { $inc: { points: pointsEarned } });
	return pointsEarned;
};

// Lấy danh sách ghế đã đặt và đã khóa cho suất chiếu
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

		// Lấy ghế đã đặt từ Booking
		const bookings = await Booking.find({
			showtimeId,
			status: { $in: ["pending", "completed"] },
		}).select("seats");
		const occupiedSeats = bookings.flatMap((b) => b.seats);

		// Lấy ghế đã khóa từ Showtime
		const lockedSeats = showtime.lockedSeats || [];

		// Gộp ghế đã đặt và ghế đã khóa
		const allUnavailableSeats = [...new Set([...occupiedSeats, ...lockedSeats])];
		const remainingSeats =
			(showtime.availableSeats || 100) - occupiedSeats.length - lockedSeats.length;

		res.json({
			success: true,
			data: {
				showtime,
				occupiedSeats: allUnavailableSeats,
				lockedSeats: lockedSeats,
				remainingSeats: remainingSeats,
				totalSeats: showtime.availableSeats || 100,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Tạo booking mới
const createBooking = async (req, res) => {
	try {
		const { showtimeId, seats, totalAmount } = req.body;
		const userId = req.user.id;

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
		const existingBooking = await Booking.findOne({
			showtimeId,
			status: { $in: ["pending", "completed"] },
			seats: { $in: seats },
		});

		if (existingBooking) {
			const conflictedSeats = seats.filter((seat) =>
				existingBooking.seats.includes(seat),
			);
			return res.status(400).json({
				success: false,
				message: `Ghế ${conflictedSeats.join(", ")} đã được đặt!`,
			});
		}

		// Cập nhật số ghế còn lại
		if (showtime.availableSeats !== undefined) {
			showtime.availableSeats = showtime.availableSeats - seats.length;
			await showtime.save();
		}

		// Cập nhật bookedSeats
		await Showtime.findByIdAndUpdate(showtimeId, {
			$addToSet: { bookedSeats: { $each: seats } },
		});

		let finalAmount = totalAmount;
		let discountAmount = 0;
		let discountType = null;
		let promotionMessage = "";

		const isFirst = await isFirstBooking(userId);
		if (isFirst) {
			discountAmount = finalAmount * 0.2;
			discountType = "first_booking";
			finalAmount = finalAmount - discountAmount;
			promotionMessage =
				"Chao mung thanh vien moi! Ban duoc giam 20% cho ve dau tien.";
		}

		const { isWeekendCombo, freeSeats } = checkWeekendCombo(
			showtime.startTime,
			seats.length,
		);
		if (isWeekendCombo && !isFirst) {
			const discountedPrice =
				(seats.length - freeSeats) * (showtime.price || 90000);
			discountAmount = finalAmount - discountedPrice;
			finalAmount = discountedPrice;
			discountType = "weekend_combo";
			promotionMessage = `Combo cuoi tuan! Mua ${seats.length} tang ${freeSeats} ve.`;
		}

		if (finalAmount < 0) finalAmount = 0;

		const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		const booking = new Booking({
			userId,
			showtimeId,
			seats,
			foods: [],
			totalAmount: finalAmount,
			originalAmount: totalAmount,
			discountAmount,
			discountType,
			status: "pending",
			ticketCode,
		});

		await booking.save();
		const pointsEarned = await updateUserPoints(userId, finalAmount);

		res.status(201).json({
			success: true,
			message: promotionMessage || "Đặt vé thành công!",
			data: {
				bookingId: booking._id,
				ticketCode,
				originalAmount: totalAmount,
				finalAmount,
				discountAmount,
				pointsEarned,
				remainingSeats: showtime.availableSeats,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy danh sách booking (Admin xem tất cả, User chỉ xem của mình)
const getMyBookings = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const isAdmin = user?.role === "admin";

		let query = {};
		if (!isAdmin) {
			query = { userId: req.user.id };
		}

		const bookings = await Booking.find(query)
			.populate({
				path: "showtimeId",
				populate: { path: "movieId", select: "title poster" },
			})
			.populate("userId", "name email")
			.sort({ createdAt: -1 });

		res.json({ success: true, data: bookings });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Hủy booking (Admin có thể hủy bất kỳ, User chỉ hủy của mình)
const cancelBooking = async (req, res) => {
	console.log("CANCEL BOOKING CALLED - ID:", req.params.bookingId);
	try {
		const user = await User.findById(req.user.id);
		const isAdmin = user?.role === "admin";

		let booking;

		if (isAdmin) {
			booking = await Booking.findById(req.params.bookingId);
		} else {
			booking = await Booking.findOne({
				_id: req.params.bookingId,
				userId: req.user.id,
			});
		}

		if (!booking) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy booking!" });
		}

		if (booking.status !== "pending") {
			return res
				.status(400)
				.json({ success: false, message: "Không thể hủy booking này!" });
		}

		booking.status = "cancelled";
		await booking.save();

		if (isAdmin) {
			const showtime = await Showtime.findById(booking.showtimeId);
			if (showtime) {
				showtime.availableSeats =
					(showtime.availableSeats || 0) + booking.seats.length;
				showtime.bookedSeats = showtime.bookedSeats?.filter(
					(seat) => !booking.seats.includes(seat),
				);
				await showtime.save();
			}
		}

		res.json({ success: true, message: "Hủy đặt vé thành công!" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getAvailableSeats,
	createBooking,
	getMyBookings,
	cancelBooking,
};