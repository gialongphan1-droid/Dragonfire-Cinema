const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema(
	{
		movieId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Movie",
			required: true,
		},
		movieTitle: String,
		cinemaName: { type: String, required: true },
		roomName: { type: String, required: true },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		price: { type: Number, required: true }, // Giá vé gốc của suất này
		seats: [
			{
				seatNumber: String, // 'A1', 'A2', 'B1'...
				seatType: {
					type: String,
					enum: ["Standard", "VIP", "Sweetbox"],
					default: "Standard",
				},
				isBooked: { type: Boolean, default: false }, // true là đã bán (Đỏ), false là trống (Trắng)
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Showtime", ShowtimeSchema);
