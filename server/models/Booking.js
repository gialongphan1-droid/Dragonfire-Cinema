const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  showtimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Showtime",
    required: true
  },
  seats: {
    type: [String],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "momo"],
    default: "cash"
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // Hết hạn sau 15 phút
  }
});

module.exports = mongoose.model("Booking", BookingSchema);