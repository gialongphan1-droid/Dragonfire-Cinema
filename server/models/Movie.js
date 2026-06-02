const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  duration: { type: Number, required: true }, // phút
  genre: [{ type: String }],
  director: { type: String, default: "" },
  cast: [{ type: String }],
  releaseDate: { type: Date },
  poster: { type: String, default: "" },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  status: { type: String, enum: ["now_showing", "coming_soon"], default: "coming_soon" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Movie", MovieSchema);