const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");



// Lấy tất cả suất chiếu (có populate thông tin phim)
const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movieId", "title poster duration rating")
      .sort({ date: 1, time: 1 });
      // Thêm availableSeats vào mỗi showtime
         res.json({ success: true, message: "Lấy danh sách suất chiếu thành công!", data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
 

// Lấy suất chiếu theo phim
const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const showtimes = await Showtime.find({ movieId })
      .populate("movieId", "title poster duration rating")
      .sort({ date: 1, time: 1 });
    res.json({ success: true, message: "Lấy suất chiếu theo phim thành công!", data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy suất chiếu theo ngày
const getShowtimesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    const showtimes = await Showtime.find({
      date: { $gte: startDate, $lt: endDate }
    }).populate("movieId", "title poster duration rating");
    
    res.json({ success: true, message: "Lấy suất chiếu theo ngày thành công!", data: showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo suất chiếu mới (admin)
const createShowtime = async (req, res) => {
  try {
    const { movieId, room, date, time, price } = req.body;
    
    // Kiểm tra phim tồn tại
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Phim không tồn tại!" });
    }
    
    // Kiểm tra trùng suất chiếu
    const existingShowtime = await Showtime.findOne({
      movieId,
      room,
      date: new Date(date),
      time
    });
    
    if (existingShowtime) {
      return res.status(400).json({ success: false, message: "Suất chiếu này đã tồn tại!" });
    }
    
    const showtime = new Showtime({
      movieId,
      room,
      date,
      time,
      price
    });
    
    await showtime.save();
    res.json({ success: true, message: "Thêm suất chiếu thành công!", data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật suất chiếu (admin)
const updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu!" });
    }
    res.json({ success: true, message: "Cập nhật suất chiếu thành công!", data: showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa suất chiếu (admin)
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!showtime) {
      return res.status(404).json({ success: false, message: "Không tìm thấy suất chiếu!" });
    }
    res.json({ success: true, message: "Xóa suất chiếu thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShowtimes,
  getShowtimesByMovie,
  getShowtimesByDate,
  createShowtime,
  updateShowtime,
  deleteShowtime
};