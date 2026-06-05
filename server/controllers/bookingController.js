const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");

const getAvailableSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;
    const showtime = await Showtime.findById(showtimeId).populate("movieId", "title duration poster");
    if (!showtime) return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu!" });
    
    // Lấy trực tiếp từ showtime.seats (đã được cập nhật isBooked khi đặt vé)
    const occupiedSeats = showtime.seats.filter(seat => seat.isBooked === true).map(seat => seat.seatNumber);
    
    console.log("📊 occupiedSeats trả về (từ showtime):", occupiedSeats);
    res.json({ success: true, data: { showtime, occupiedSeats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, totalAmount } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";
    
    if (!showtimeId || !seats || seats.length === 0) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn ghế!" });
    }
    
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ success: false, message: "Suất chiếu không tồn tại!" });
    
    // Kiểm tra ghế đã được đặt chưa (dựa trên isBooked trong showtime)
    const alreadyBooked = seats.filter(seatName => {
      const seat = showtime.seats.find(s => s.seatNumber === seatName);
      return seat && seat.isBooked === true;
    });
    
    if (alreadyBooked.length > 0 && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: `Ghế ${alreadyBooked.join(", ")} đã được đặt!`
      });
    }
    
    // Kiểm tra pending booking (chỉ với user)
    if (!isAdmin) {
      const existingPending = await Booking.findOne({
        userId,
        showtimeId,
        status: "pending",
        expiresAt: { $gt: new Date() }
      });
      if (existingPending) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã có một đơn đặt vé đang chờ thanh toán cho suất chiếu này!"
        });
      }
    }
    
    const ticketCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const nowTime = new Date();
    const expiresAt = isAdmin ? null : new Date(nowTime.getTime() + 5 * 60 * 1000);
    
    console.log("⏰ now (server):", nowTime);
    console.log("⏰ expiresAt:", expiresAt);
    
    // Tạo booking mới
    const booking = new Booking({
      bookingCode: ticketCode,
      userId: userId,
      showtimeId: showtimeId,
      seats: seats,
      customerName: req.user.name || "Khách",
      customerPhone: "",
      customerEmail: req.user.email || "",
      totalPrice: totalAmount,
      totalAmount: totalAmount,
      ticketCode: ticketCode,
      status: "pending",
      expiresAt: expiresAt
    });
    
    await booking.save();
    console.log("✅ Booking đã lưu, ID:", booking._id);
    
    // Cập nhật isBooked trong showtime
    const showtimeToUpdate = await Showtime.findById(showtimeId);
    for (const seatName of seats) {
      const seat = showtimeToUpdate.seats.find(s => s.seatNumber === seatName);
      if (seat) {
        console.log(`   Ghế ${seatName} isBooked trước:`, seat.isBooked);
        seat.isBooked = true;
        console.log(`   Ghế ${seatName} isBooked sau:`, seat.isBooked);
      }
    }
    await showtimeToUpdate.save();
    
    res.status(201).json({
      success: true,
      message: isAdmin ? "Admin đặt vé thành công!" : "Đặt vé thành công! Vui lòng thanh toán trong 5 phút.",
      data: { 
        bookingId: booking._id, 
        ticketCode, 
        totalAmount,
        expiresAt: expiresAt || null
      }
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    let bookings;
    
    if (isAdmin) {
      bookings = await Booking.find()
        .populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster" } })
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ userId: req.user.id })
        .populate({ path: "showtimeId", populate: { path: "movieId", select: "title poster" } })
        .sort({ createdAt: -1 });
    }
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy booking!" });
    
    const isAdmin = req.user.role === "admin";
    const isOwner = booking.userId.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền hủy vé này!" });
    }
    
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Không thể hủy booking này!" });
    }
    
    // Giải phóng ghế trong showtime
    const showtime = await Showtime.findById(booking.showtimeId);
    if (showtime) {
      for (const seatName of booking.seats) {
        const seat = showtime.seats.find(s => s.seatNumber === seatName);
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

module.exports = { getAvailableSeats, createBooking, getMyBookings, cancelBooking };