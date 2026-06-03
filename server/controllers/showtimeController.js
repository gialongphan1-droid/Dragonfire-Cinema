const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");


exports.getAllShowtimes = async (req, res) => {
	try {
		const data = await Showtime.find().populate("movieId");

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
			roomName,
			startTime,
			price,
		} = req.body;

		const movie = await Movie.findById(movieId);

		if (!movie) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy phim",
			});
		}

		const endTime = new Date(
			new Date(startTime).getTime() +
				movie.duration * 60000
		);

		const seats = [];

		for (const row of ["A", "B", "C", "D", "E"]) {
			for (let i = 1; i <= 10; i++) {
				seats.push({
					seatNumber: `${row}${i}`,
					seatType: "Standard",
					isBooked: false,
				});
			}
		}

		const showtime = await Showtime.create({
			movieId,
			movieTitle: movie.title,
			cinemaName,
			roomName,
			startTime,
			endTime,
			price,
			seats,
		});

		res.status(201).json({
			success: true,
			data: showtime,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.getShowtimeById = async (req, res) => {
	try {
		const data = await Showtime.findById(req.params.id)
			.populate("movieId");

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
			{ new: true }
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