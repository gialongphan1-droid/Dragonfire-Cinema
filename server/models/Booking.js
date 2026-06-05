const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	showtimeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Showtime",
		required: true,
	},
	seats: [{ type: String, required: true }],
	foods: [
		{
			foodId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCombo" },
			quantity: Number,
		},
	],
	totalAmount: { type: Number, required: true },
	originalAmount: { type: Number, default: 0 },
	discountAmount: { type: Number, default: 0 },
	discountType: { type: String, default: null },
	voucherCode: { type: String, default: null },
	status: {
		type: String,
		enum: ["pending", "completed", "failed", "cancelled"],
		default: "pending",
	},
	paymentMethod: { type: String, default: "cash" },
	paymentCode: { type: String },
	ticketCode: { type: String },
	createdAt: { type: Date, default: Date.now },
	expireAt: {
		type: Date,
		default: () => new Date(Date.now() + 15 * 60 * 1000),
	},
});

module.exports = mongoose.model("Booking", bookingSchema);
