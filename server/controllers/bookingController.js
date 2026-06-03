const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const User = require("../models/User");

// Lấy danh sách ghế đã đặt của suất chiếu
const getBookedSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    
    // Lấy các booking đã thanh toán hoặc đang chờ (chưa hết hạn)
    const bookings = await Booking.find({
      showtimeId,
      status: { $in: ["paid", "pending"] },
      expireAt: { $gt: new Date() }
    });
    
    const bookedSeats = bookings.flatMap(b => b.seats);
    
    res.json({ success: true, data: bookedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo booking mới (giữ ghế)
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, paymentMethod } = req.body;
    const userId = req.user._id;
    
    // Kiểm tra suất chiếu
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Suất chiếu không tồn tại!" });
    }
    
    // Kiểm tra ghế đã được đặt chưa
    const existingBookings = await Booking.find({
      showtimeId,
      status: { $in: ["paid", "pending"] },
      expireAt: { $gt: new Date() },
      seats: { $in: seats }
    });
    
    if (existingBookings.length > 0) {
      const bookedSeats = existingBookings.flatMap(b => b.seats);
      const conflictSeats = seats.filter(s => bookedSeats.includes(s));
      return res.status(400).json({ 
        success: false, 
        message: `Ghế ${conflictSeats.join(", ")} đã được đặt!` 
      });
    }
    
    // Tính tổng tiền
    const totalPrice = seats.length * showtime.price;
    
    // Tạo booking
    const booking = new Booking({
      userId,
      showtimeId,
      seats,
      totalPrice,
      paymentMethod,
      status: "pending"
    });
    
    await booking.save();
    
    // Cập nhật điểm thưởng cho user (1% giá trị vé)
    const points = Math.floor(totalPrice / 1000);
    await User.findByIdAndUpdate(userId, { $inc: { points: points } });
    
    res.json({ 
      success: true, 
      message: "Đặt vé thành công! Vui lòng thanh toán trong 15 phút.",
      data: booking 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xác nhận thanh toán
const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy booking!" });
    }
    
    if (booking.status === "paid") {
      return res.status(400).json({ success: false, message: "Vé đã được thanh toán!" });
    }
    
    booking.status = "paid";
    await booking.save();
    
    res.json({ success: true, message: "Thanh toán thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử đặt vé của user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("showtimeId")
      .sort({ bookingDate: -1 });
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBookedSeats,
  createBooking,
  confirmPayment,
  getUserBookings
};