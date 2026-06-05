const Movie = require("../models/Movie");

// Lấy tất cả phim cho trang MovieList (không phân trang)
const getMovies = async (req, res) => {
	try {
		const movies = await Movie.find().sort({ createdAt: -1 });
		res.json({ success: true, data: movies });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy phim cho trang Home (có phân trang - 5 phim/trang)
const getMoviesForHome = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = 5; // ✅ 5 phim mỗi trang
		const skip = (page - 1) * limit;

		const totalMovies = await Movie.countDocuments();
		const movies = await Movie.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);
		const totalPages = Math.ceil(totalMovies / limit);

		res.json({
			success: true,
			data: {
				movies,
				pagination: {
					currentPage: page,
					totalPages: totalPages,
					totalItems: totalMovies,
					itemsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Lấy chi tiết 1 phim
const getMovieById = async (req, res) => {
	try {
		const movie = await Movie.findById(req.params.id);
		if (!movie) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy phim!" });
		}
		res.json({ success: true, data: movie });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Tạo phim mới (admin)
const createMovie = async (req, res) => {
	try {
		const {
			title,
			description,
			duration,
			genre,
			director,
			cast,
			releaseDate,
			poster,
			rating,
		} = req.body;

		const newMovie = new Movie({
			title,
			description,
			duration,
			genre,
			director,
			cast,
			releaseDate,
			poster,
			rating,
		});

		await newMovie.save();
		res.json({
			success: true,
			message: "Thêm phim thành công!",
			data: newMovie,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Cập nhật phim (admin)
const updateMovie = async (req, res) => {
	try {
		const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!movie) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy phim!" });
		}
		res.json({
			success: true,
			message: "Cập nhật phim thành công!",
			data: movie,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

// Xóa phim (admin)
const deleteMovie = async (req, res) => {
	try {
		const movie = await Movie.findByIdAndDelete(req.params.id);
		if (!movie) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy phim!" });
		}
		res.json({ success: true, message: "Xóa phim thành công!" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

module.exports = {
	getMovies,
	getMoviesForHome,
	getMovieById,
	createMovie,
	updateMovie,
	deleteMovie,
};
