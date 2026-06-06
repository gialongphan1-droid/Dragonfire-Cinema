const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// @desc    Get remaining seats for a showtime (realtime)
// @route   GET /api/showtimes/:id/remaining-seats
// @access  Public
const getRemainingSeats = async (req, res) => {
	try {
		const showtime = await Showtime.findById(req.params.id);

		if (!showtime) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy suất chiếu",
			});
		}

		// Tính toán số ghế còn lại
		const totalSeats = showtime.seats?.length || showtime.availableSeats || 100;
		const bookedCount = showtime.bookedSeats?.length || 0;
		const remainingSeats = totalSeats - bookedCount;

		res.json({
			success: true,
			remainingSeats: remainingSeats,
			totalSeats: totalSeats,
			bookedSeats: showtime.bookedSeats || [],
			lockedSeats: showtime.lockedSeats || [],
		});
	} catch (error) {
		console.error("Lỗi lấy số ghế còn lại:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

const getAvailableSeatsCount = async (showtimeId) => {
	const showtime = await Showtime.findById(showtimeId).select("seats");
	if (!showtime) return 0;
	const totalSeats = showtime.seats.length;
	const bookedSeats = showtime.seats.filter(
		(seat) => seat.isBooked === true,
	).length;
	return totalSeats - bookedSeats;
};

// Lấy tất cả suất chiếu
exports.getAllShowtimes = async (req, res) => {
	try {
		const showtimes = await Showtime.find()
			.populate("movieId")
			.populate("roomId");
		const showtimesWithSeats = await Promise.all(
			showtimes.map(async (st) => {
				const availableSeats = await getAvailableSeatsCount(st._id);
				return {
					...st._doc,
					availableSeats: availableSeats,
					totalSeats: st.seats?.length || 0,
				};
			}),
		);
		res.status(200).json({ success: true, data: showtimesWithSeats });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy suất chiếu theo phim
exports.getShowtimesByMovie = async (req, res) => {
	try {
		const { movieId } = req.params;
		const data = await Showtime.find({ movieId }).sort({ startTime: 1 });
		res.status(200).json({ success: true, data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy chi tiết suất chiếu
exports.getShowtimeById = async (req, res) => {
	try {
		const data = await Showtime.findById(req.params.id)
			.populate("movieId")
			.populate("roomId");
		if (!data) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}
		res.status(200).json({ success: true, data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy danh sách ghế trống
exports.getAvailableSeats = async (req, res) => {
	try {
		const showtime = await Showtime.findById(req.params.id);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}
		const availableSeats = showtime.seats.filter((seat) => !seat.isBooked);
		res.status(200).json({
			success: true,
			data: {
				total: showtime.seats.length,
				available: availableSeats.length,
				seats: availableSeats,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Tạo suất chiếu mới
exports.createShowtime = async (req, res) => {
	try {
		const { movieId, cinemaName, roomId, startTime, rows, columns } = req.body;

		if (!movieId || !cinemaName || !roomId || !startTime) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
		}

		const serverNow = new Date();
		const selectedTime = new Date(startTime);
		if (selectedTime <= serverNow) {
			return res.status(400).json({
				success: false,
				message:
					"Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.",
			});
		}

		const movie = await Movie.findById(movieId);
		if (!movie)
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy phim" });

		const room = await Room.findById(roomId);
		if (!room)
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy phòng chiếu" });

		const endTime = new Date(
			new Date(startTime).getTime() + movie.duration * 60000,
		);

		// ✅ SỬA: Dùng rows và columns từ request (hoặc lấy từ room)
		const finalRows = rows || room.rows || 5;
		const finalCols = columns || room.columns || 10;

		const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
		const vipRows = ["F", "G", "H"];

		const seats = [];
		for (let i = 0; i < finalRows; i++) {
			for (let j = 1; j <= finalCols; j++) {
				seats.push({
					seatNumber: `${rowLetters[i]}${j}`,
					seatType: vipRows.includes(rowLetters[i]) ? "VIP" : "Standard",
					isBooked: false,
					isLocked: false,
				});
			}
		}

		const showtime = await Showtime.create({
			movieId,
			movieTitle: movie.title,
			cinemaName,
			roomId,
			roomName: room.name,
			startTime,
			endTime,
			price: req.body.price || 90000,
			rows: finalRows,
			columns: finalCols,
			seats,
			availableSeats: seats.length,
		});

		res.status(201).json({ success: true, data: showtime });
	} catch (error) {
		console.error("Server error:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Cập nhật suất chiếu
exports.updateShowtime = async (req, res) => {
	try {
		const { rows, columns, startTime } = req.body;
		const updateData = { ...req.body };

		// Nếu có thay đổi rows hoặc columns, tạo lại seats
		if (rows || columns) {
			const showtime = await Showtime.findById(req.params.id);
			if (showtime) {
				const finalRows = rows || showtime.rows || 8;
				const finalCols = columns || showtime.columns || 10;
				const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
				const vipRows = ["F", "G", "H"];
				const newSeats = [];

				for (let i = 0; i < finalRows; i++) {
					for (let j = 1; j <= finalCols; j++) {
						newSeats.push({
							seatNumber: `${rowLetters[i]}${j}`,
							seatType: vipRows.includes(rowLetters[i]) ? "VIP" : "Standard",
							isBooked: false,
							isLocked: false,
						});
					}
				}
				updateData.seats = newSeats;
				updateData.rows = finalRows;
				updateData.columns = finalCols;
				updateData.availableSeats = newSeats.length;
			}
		}

		// Kiểm tra thời gian
		if (startTime) {
			const serverNow = new Date();
			const selectedTime = new Date(startTime);
			if (selectedTime <= serverNow) {
				return res.status(400).json({
					success: false,
					message:
						"Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.",
				});
			}
		}

		const data = await Showtime.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		});

		if (!data) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}

		res.status(200).json({ success: true, data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Xóa suất chiếu
exports.deleteShowtime = async (req, res) => {
	try {
		const showtime = await Showtime.findByIdAndDelete(req.params.id);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}
		res.status(200).json({ success: true, message: "Xóa thành công" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// ============ QUẢN LÝ KHÓA GHẾ (ADMIN) ============

// Khóa ghế
const lockSeats = async (req, res) => {
	try {
		const { showtimeId, seats } = req.body;

		if (!showtimeId || !seats || seats.length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng chọn ghế cần khóa!" });
		}

		const showtime = await Showtime.findById(showtimeId);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}

		const bookedSeats = showtime.seats.filter(
			(seat) => seat.isBooked && seats.includes(seat.seatNumber),
		);
		if (bookedSeats.length > 0) {
			return res.status(400).json({
				success: false,
				message: `Ghế ${bookedSeats.map((s) => s.seatNumber).join(", ")} đã được đặt, không thể khóa!`,
			});
		}

		showtime.lockedSeats = [
			...new Set([...(showtime.lockedSeats || []), ...seats]),
		];
		showtime.seats = showtime.seats.map((seat) => ({
			...seat._doc,
			isLocked: showtime.lockedSeats.includes(seat.seatNumber),
		}));

		await showtime.save();

		res.json({
			success: true,
			message: `Đã khóa ${seats.length} ghế thành công!`,
			lockedSeats: showtime.lockedSeats,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Mở khóa ghế
const unlockSeats = async (req, res) => {
	try {
		const { showtimeId, seats } = req.body;

		if (!showtimeId || !seats || seats.length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "Vui lòng chọn ghế cần mở khóa!" });
		}

		const showtime = await Showtime.findById(showtimeId);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}

		showtime.lockedSeats = (showtime.lockedSeats || []).filter(
			(s) => !seats.includes(s),
		);
		showtime.seats = showtime.seats.map((seat) => ({
			...seat._doc,
			isLocked: showtime.lockedSeats.includes(seat.seatNumber),
		}));

		await showtime.save();

		res.json({
			success: true,
			message: `Đã mở khóa ${seats.length} ghế thành công!`,
			lockedSeats: showtime.lockedSeats,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy trạng thái ghế
const getSeatsStatus = async (req, res) => {
	try {
		const showtime = await Showtime.findById(req.params.id);
		if (!showtime) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy suất chiếu" });
		}

		const bookings = await Booking.find({
			showtimeId: req.params.id,
			status: { $in: ["pending", "completed"] },
		});
		const bookedSeatsFromBooking = bookings.flatMap((b) => b.seats);

		const seatsStatus = (showtime.seats || []).map((seat) => ({
			seatNumber: seat.seatNumber,
			seatType: seat.seatType,
			isBooked:
				seat.isBooked || bookedSeatsFromBooking.includes(seat.seatNumber),
			isLocked: (showtime.lockedSeats || []).includes(seat.seatNumber),
			isAvailable:
				!(seat.isBooked || bookedSeatsFromBooking.includes(seat.seatNumber)) &&
				!(showtime.lockedSeats || []).includes(seat.seatNumber),
		}));

		res.json({
			success: true,
			data: {
				totalSeats: seatsStatus.length,
				availableSeats: seatsStatus.filter((s) => s.isAvailable).length,
				bookedSeats: seatsStatus.filter((s) => s.isBooked).length,
				lockedSeats: seatsStatus.filter((s) => s.isLocked).length,
				seats: seatsStatus,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// ============ EXPORTS ============
module.exports = {
	getAllShowtimes: exports.getAllShowtimes,
	getShowtimesByMovie: exports.getShowtimesByMovie,
	getShowtimeById: exports.getShowtimeById,
	getAvailableSeats: exports.getAvailableSeats,
	createShowtime: exports.createShowtime,
	updateShowtime: exports.updateShowtime,
	deleteShowtime: exports.deleteShowtime,
	lockSeats,
	unlockSeats,
	getSeatsStatus,
	getRemainingSeats,
};
