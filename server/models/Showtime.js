const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true
  },
  room: {
    type: String,
    required: true,
    enum: ["Phòng 1 - IMAX", "Phòng 2 - 2D", "Phòng 3 - 2D", "Phòng 4 - 2D", "Phòng 5 - 3D", "Phòng 6 - VIP"]
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 50000
  },
  availableSeats: {
    type: Number,
    default: 100
  },
  bookedSeats: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ["available", "sold_out", "cancelled"],
    default: "available"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Showtime", ShowtimeSchema);