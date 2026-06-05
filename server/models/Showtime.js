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
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: true,
		},
		roomName: { type: String, required: true },
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		price: { type: Number, default: 90000 },
		availableSeats: { type: Number, default: 100 },
		rows: { type: Number, default: 5 },
		columns: { type: Number, default: 10 },
		seats: [
			{
				seatNumber: String,
				seatType: {
					type: String,
					enum: ["Standard", "VIP", "Sweetbox"],
					default: "Standard",
				},
				isBooked: { type: Boolean, default: false },
				isLocked: { type: Boolean, default: false },
			},
		],
		bookedSeats: { type: [String], default: [] },
		lockedSeats: { type: [String], default: [] },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Showtime", ShowtimeSchema);
