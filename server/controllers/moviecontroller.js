const Movie = require("../models/Movie");

// Lấy tất cả phim
const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json({ success: true, message: "Lấy danh sách phim thành công!", data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết 1 phim
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim!" });
    }
    res.json({ success: true, message: "Lấy chi tiết phim thành công!", data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo phim mới (admin)
const createMovie = async (req, res) => {
  try {
    const { title, description, duration, genre, director, cast, releaseDate, poster, rating } = req.body;
    
    const newMovie = new Movie({
      title,
      description,
      duration,
      genre,
      director,
      cast,
      releaseDate,
      poster,
      rating
    });
    
    await newMovie.save();
    res.json({ success: true, message: "Thêm phim thành công!", data: newMovie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật phim (admin)
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim!" });
    }
    res.json({ success: true, message: "Cập nhật phim thành công!", data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa phim (admin)
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Không tìm thấy phim!" });
    }
    res.json({ success: true, message: "Xóa phim thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};