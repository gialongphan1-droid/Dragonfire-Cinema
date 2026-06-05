const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");

const getAvailableSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const showtime = await Showtime.findById(showtimeId).populate("movieId", "title duration poster");
    if (!showtime) return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu!" });
    const bookings = await Booking.find({ showtimeId, status: { $in: ["pending", "completed"] } }).select("seats");
    const occupiedSeats = bookings.flatMap(b => b.seats);
    res.json({ success: true, data: { showtime, occupiedSeats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, totalAmount } = req.body;
    const userId = req.user.id;
    if (!showtimeId || !seats || seats.length === 0) return res.status(400).json({ success: false, message: "Vui lòng chọn ghế!" });
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ success: false, message: "Suất chiếu không tồn tại!" });
    const existingBooking = await Booking.findOne({ showtimeId, status: { $in: ["pending", "completed"] }, seats: { $in: seats } });
    if (existingBooking) {
      const conflictedSeats = seats.filter(seat => existingBooking.seats.includes(seat));
      return res.status(400).json({ success: false, message: `Ghế ${conflictedSeats.join(", ")} đã được đặt!` });
    }
    const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const booking = new Booking({ userId, showtimeId, seats, foods: [], totalAmount, status: "pending", ticketCode });
    await booking.save();
    res.status(201).json({ success: true, message: "Đặt vé thành công!", data: { bookingId: booking._id, ticketCode, totalAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster" } }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
   console.log("🔥 CANCEL BOOKING CALLED - ID:", req.params.bookingId);
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, userId: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy booking!" });
    if (booking.status !== "pending") return res.status(400).json({ success: false, message: "Không thể hủy booking này!" });
    booking.status = "cancelled";
    await booking.save();
    res.json({ success: true, message: "Hủy đặt vé thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAvailableSeats, createBooking, getMyBookings, cancelBooking };
