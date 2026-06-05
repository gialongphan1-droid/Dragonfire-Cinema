const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true },  // bỏ required
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: String, required: true }],
  customerName: { type: String, default: "" },   // bỏ required
  customerPhone: { type: String, default: "" },  // bỏ required
  customerEmail: { type: String, default: "" },
  totalAmount: { type: Number, required: true }, // thêm totalAmount thay vì totalPrice
  totalPrice: { type: Number, default: 0 },      // giữ lại cho tương thích ngược
  status: { type: String, enum: ["pending", "completed", "cancelled", "confirmed"], default: "pending" },
  paymentStatus: { type: String, enum: ["unpaid", "paid", "paid_by_admin", "refunded"], default: "unpaid" },
  paidAt: { type: Date },
  ticketCode: { type: String, default: "" },     // thêm ticketCode
  expiresAt: { type: Date, default: () => Date.now() + 5 * 60 * 1000 }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);