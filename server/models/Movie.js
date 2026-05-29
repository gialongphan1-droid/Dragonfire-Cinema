const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		duration: { type: Number, required: true }, // Số phút phim
		description: String,
		genres: [{ type: String }], // Ví dụ: ['Hành Động', 'Kinh Dị']
		posterUrl: String,
		trailerUrl: String,
		releaseDate: Date,
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Movie", MovieSchema);
