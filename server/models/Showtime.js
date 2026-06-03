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
		
		// ✅ THÊM roomId LIÊN KẾT VỚI PHÒNG CHIẾU
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room",
			required: true,
		},
		
		// ⚠️ GIỮ LẠI roomName ĐỂ HIỂN THỊ (HOẶC CÓ THỂ BỎ)
		roomName: { type: String, required: true },
		
		startTime: { type: Date, required: true },
		endTime: { type: Date, required: true },
		price: { type: Number, required: true },
		seats: [
			{
				seatNumber: String,
				seatType: {
					type: String,
					enum: ["Standard", "VIP", "Sweetbox"],
					default: "Standard",
				},
				isBooked: { type: Boolean, default: false },
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Showtime", ShowtimeSchema);