const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		showtimeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Showtime",
			required: true,
		},
		seatsBooked: [{ type: String }], // Mảng các ghế khách chọn, ví dụ: ['A1', 'A2']
		foods: [
			{
				name: String,
				quantity: Number,
				price: Number,
			},
		],
		totalAmount: { type: Number, required: true }, // Tổng tiền cuối cùng sau khi cộng hết
		status: {
			type: String,
			enum: ["Cho thanh toan", "Da thanh toan", "That bai"],
			default: "Cho thanh toan",
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Booking", BookingSchema);
