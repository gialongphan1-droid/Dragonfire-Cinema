const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// Lấy tất cả suất chiếu
const getAllShowtimes = async (req, res) => {
    try {
        const showtimes = await Showtime.find()
            .populate("movieId")
            .populate("roomId")
            .sort({ startTime: -1 });

        for (let showtime of showtimes) {
            const bookings = await Booking.find({
                showtimeId: showtime._id,
                status: { $in: ["pending", "completed"] },
            });
            const bookedSeatsFromBooking = bookings.flatMap((b) => b.seats);

            const allBookedSeats = [
                ...new Set([
                    ...(showtime.bookedSeats || []),
                    ...bookedSeatsFromBooking,
                ]),
            ];

            const totalSeats = showtime.seats?.length || showtime.availableSeats || 100;
            const availableSeats = totalSeats - allBookedSeats.length;

            showtime._doc.bookedSeats = allBookedSeats;
            showtime._doc.availableSeatsCount = availableSeats;
            showtime._doc.totalSeats = totalSeats;
        }

        res.status(200).json({ success: true, data: showtimes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy suất chiếu theo phim
const getShowtimesByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const data = await Showtime.find({ movieId }).sort({ startTime: 1 });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy chi tiết suất chiếu theo ID
const getShowtimeById = async (req, res) => {
    try {
        const data = await Showtime.findById(req.params.id)
            .populate("movieId")
            .populate("roomId");
        if (!data) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách ghế trống
const getAvailableSeats = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }

        const bookings = await Booking.find({
            showtimeId: req.params.id,
            status: { $in: ["pending", "completed"] },
        });
        const bookedSeatsFromBooking = bookings.flatMap((b) => b.seats);

        const seats = showtime.seats.map((seat) => ({
            ...seat.toObject(),
            isBooked: seat.isBooked || bookedSeatsFromBooking.includes(seat.seatNumber),
        }));

        const availableSeats = seats.filter((seat) => !seat.isBooked);

        res.status(200).json({
            success: true,
            data: {
                total: seats.length,
                available: availableSeats.length,
                seats: availableSeats,
                allSeats: seats,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo suất chiếu mới
const createShowtime = async (req, res) => {
    try {
        const { movieId, cinemaName, roomId, startTime, price, rows, columns } = req.body;

        if (!movieId || !cinemaName || !roomId || !startTime) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
        }

        const serverNow = new Date();
        const selectedTime = new Date(startTime);
        if (selectedTime <= serverNow) {
            return res.status(400).json({
                success: false,
                message: "Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.",
            });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ success: false, message: "Không tìm thấy phim" });

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng chiếu" });

        const endTime = new Date(new Date(startTime).getTime() + movie.duration * 60000);

        const finalRows = rows || room.rows || 5;
        const finalCols = columns || room.columns || 10;
        const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

        const seats = [];
        for (let i = 0; i < finalRows; i++) {
            for (let j = 1; j <= finalCols; j++) {
                seats.push({
                    seatNumber: `${rowLetters[i]}${j}`,
                    seatType: room.type === "VIP" ? "VIP" : "Standard",
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
            price: price || 90000,
            seats: seats,
            availableSeats: seats.length,
            rows: finalRows,
            columns: finalCols,
        });

        res.status(201).json({
            success: true,
            message: "Thêm suất chiếu thành công!",
            data: showtime,
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật suất chiếu
const updateShowtime = async (req, res) => {
    try {
        const { startTime } = req.body;

        if (startTime) {
            const serverNow = new Date();
            const selectedTime = new Date(startTime);
            if (selectedTime <= serverNow) {
                return res.status(400).json({
                    success: false,
                    message: "Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.",
                });
            }
        }

        const data = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!data) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }

        res.status(200).json({ success: true, message: "Cập nhật thành công!", data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa suất chiếu
const deleteShowtime = async (req, res) => {
    try {
        const showtime = await Showtime.findByIdAndDelete(req.params.id);
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }
        res.status(200).json({ success: true, message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// QUẢN LÝ KHÓA/MỞ KHÓA GHẾ (ADMIN)
// ============================================

// Khóa ghế
const lockSeats = async (req, res) => {
    try {
        const { showtimeId, seats } = req.body;

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }

        const alreadyLocked = seats.filter((s) => showtime.lockedSeats?.includes(s));
        if (alreadyLocked.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Ghế ${alreadyLocked.join(", ")} đã bị khóa!`,
            });
        }

        const bookings = await Booking.find({
            showtimeId,
            status: { $in: ["pending", "completed"] },
            seats: { $in: seats },
        });

        if (bookings.length > 0) {
            const bookedSeats = bookings.flatMap((b) => b.seats);
            const conflictSeats = seats.filter((s) => bookedSeats.includes(s));
            return res.status(400).json({
                success: false,
                message: `Ghế ${conflictSeats.join(", ")} đã được đặt, không thể khóa!`,
            });
        }

        showtime.lockedSeats = [...new Set([...(showtime.lockedSeats || []), ...seats])];

        if (showtime.seats && showtime.seats.length > 0) {
            showtime.seats = showtime.seats.map((seat) => ({
                ...seat.toObject(),
                isLocked: showtime.lockedSeats.includes(seat.seatNumber),
            }));
        }

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

        const showtime = await Showtime.findById(showtimeId);
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }

        showtime.lockedSeats = (showtime.lockedSeats || []).filter((s) => !seats.includes(s));

        if (showtime.seats && showtime.seats.length > 0) {
            showtime.seats = showtime.seats.map((seat) => ({
                ...seat.toObject(),
                isLocked: showtime.lockedSeats.includes(seat.seatNumber),
            }));
        }

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

// Lấy danh sách ghế kèm trạng thái
const getSeatsStatus = async (req, res) => {
    try {
        const showtime = await Showtime.findById(req.params.id);
        if (!showtime) {
            return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu" });
        }

        const bookings = await Booking.find({
            showtimeId: req.params.id,
            status: { $in: ["pending", "completed"] },
        });
        const bookedSeats = bookings.flatMap((b) => b.seats);

        const seatsStatus = (showtime.seats || []).map((seat) => ({
            seatNumber: seat.seatNumber,
            seatType: seat.seatType,
            isBooked: bookedSeats.includes(seat.seatNumber),
            isLocked: (showtime.lockedSeats || []).includes(seat.seatNumber),
            isAvailable: !bookedSeats.includes(seat.seatNumber) && !(showtime.lockedSeats || []).includes(seat.seatNumber),
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

module.exports = {
    getAllShowtimes,
    getShowtimesByMovie,
    getShowtimeById,
    getAvailableSeats,
    createShowtime,
    updateShowtime,
    deleteShowtime,
    lockSeats,
    unlockSeats,
    getSeatsStatus,
};