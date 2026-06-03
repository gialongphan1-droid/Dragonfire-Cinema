const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");
const Room = require("../models/Room"); // ← THÊM DÒNG NÀY

exports.getAllShowtimes = async (req, res) => {
	try {
		const data = await Showtime.find().populate("movieId").populate("roomId");

		res.status(200).json({
			success: true,
			data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.createShowtime = async (req, res) => {
	try {
		const {
			movieId,
			cinemaName,
			roomId,        // ← ĐỔI roomName THÀNH roomId
			startTime,
			price,
		} = req.body;

		// Debug log
		console.log("📦 Received:", { movieId, cinemaName, roomId, startTime, price });

		// Kiểm tra dữ liệu đầu vào
		if (!movieId || !cinemaName || !roomId || !startTime || !price) {
			return res.status(400).json({
				success: false,
				message: "Vui lòng nhập đầy đủ thông tin"
			});
		}

		// Lấy thông tin phim
		const movie = await Movie.findById(movieId);
		if (!movie) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy phim",
			});
		}

		// Lấy thông tin phòng
		const room = await Room.findById(roomId);
		if (!room) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy phòng chiếu",
			});
		}

		// Tính endTime
		const endTime = new Date(
			new Date(startTime).getTime() +
				movie.duration * 60000
		);

		// Tạo seats dựa trên số hàng và cột của phòng
		const seats = [];
		const rows = room.rows || 5;
		const cols = room.columns || 10;
		const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

		for (let i = 0; i < rows; i++) {
			for (let j = 1; j <= cols; j++) {
				seats.push({
					seatNumber: `${rowLetters[i]}${j}`,
					seatType: room.type === "VIP" ? "VIP" : "Standard",
					isBooked: false,
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
			price,
			seats,
		});

		console.log("✅ Showtime created:", showtime._id);

		res.status(201).json({
			success: true,
			data: showtime,
		});
	} catch (error) {
		console.error("❌ Server error:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getShowtimeById = async (req, res) => {
	try {
		const data = await Showtime.findById(req.params.id)
			.populate("movieId")
			.populate("roomId");

		res.status(200).json({
			success: true,
			data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateShowtime = async (req, res) => {
	try {
		const data = await Showtime.findByIdAndUpdate(
			req.params.id,
			req.body,
			{ new: true, runValidators: true }
		);

		res.status(200).json({
			success: true,
			data,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.deleteShowtime = async (req, res) => {
	try {
		await Showtime.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: "Xóa thành công",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// Lấy suất chiếu theo phim
exports.getShowtimesByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const data = await Showtime.find({ movieId }).sort({ startTime: 1 });
        
        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Lấy danh sách ghế trống
exports.getAvailableSeats = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        
        if (!showtime) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy suất chiếu"
            });
        }
        
        const availableSeats = showtime.seats.filter(seat => !seat.isBooked);
        
        res.status(200).json({
            success: true,
            data: {
                total: showtime.seats.length,
                available: availableSeats.length,
                seats: availableSeats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};