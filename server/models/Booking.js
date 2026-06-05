const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: "Showtime", required: true },
  seats: [{ type: String, required: true }],
  foods: [{ foodId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCombo" }, quantity: Number }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
  paymentMethod: { type: String },
  paymentCode: { type: String },
  ticketCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
