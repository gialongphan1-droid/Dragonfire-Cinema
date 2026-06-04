import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const MovieAdmin = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [errors, setErrors] = useState({}); // Thêm state lỗi
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    genre: "",
    director: "",
    cast: "",
    releaseDate: "",
    poster: "",
    trailerUrl: "",
    rating: "",
  });

  const token = localStorage.getItem("token");

  // Lấy ngày hôm nay để set min cho input date
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies`);
      if (response.data.success) {
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm validate form
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra tên phim
    if (!formData.title.trim()) {
      newErrors.title = "Tên phim không được để trống!";
    }

    // Kiểm tra thời lượng
    if (!formData.duration) {
      newErrors.duration = "Thời lượng phim không được để trống!";
    } else if (formData.duration <= 0) {
      newErrors.duration = "Thời lượng phải lớn hơn 0!";
    }

    // Kiểm tra thể loại
    if (!formData.genre.trim()) {
      newErrors.genre = "Thể loại phim không được để trống!";
    }

    // Kiểm tra đạo diễn
    if (!formData.director.trim()) {
      newErrors.director = "Tên đạo diễn không được để trống!";
    }

    // Kiểm tra diễn viên
    if (!formData.cast.trim()) {
      newErrors.cast = "Diễn viên không được để trống!";
    }

    // Kiểm tra ngày phát hành
    if (!formData.releaseDate) {
      newErrors.releaseDate = "Ngày phát hành không được để trống!";
    }

    // Kiểm tra đánh giá
    if (!formData.rating && formData.rating !== 0) {
      newErrors.rating = "Đánh giá không được để trống!";
    } else if (formData.rating < 0 || formData.rating > 10) {
      newErrors.rating = "Đánh giá phải từ 0 đến 10!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xóa lỗi khi người dùng bắt đầu nhập
  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: "" });
    }
  };

  // Xử lý khi nhập thể loại
  const handleGenreChange = (e) => {
    let value = e.target.value;
    setFormData({ ...formData, genre: value });
    clearFieldError("genre");
  };

  // Xử lý khi nhập diễn viên
  const handleCastChange = (e) => {
    let value = e.target.value;
    setFormData({ ...formData, cast: value });
    clearFieldError("cast");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate trước khi submit
    if (!validateForm()) {
      // Cuộn lên đầu form để thấy lỗi
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Xử lý genre: tách chuỗi thành array
    const genreArray = formData.genre
      .split(",")
      .map(g => g.trim())
      .filter(g => g !== "");
    
    // Xử lý cast: tách chuỗi thành array
    const castArray = formData.cast
      .split(",")
      .map(c => c.trim())
      .filter(c => c !== "");

    const dataToSend = {
      title: formData.title,
      description: formData.description,
      duration: Number(formData.duration),
      genre: genreArray,
      director: formData.director,
      cast: castArray,
      releaseDate: formData.releaseDate,
      poster: formData.poster,
      trailerUrl: formData.trailerUrl,
      rating: formData.rating ? Number(formData.rating) : 0,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;

      if (editingMovie) {
        response = await axios.put(
          `${API_URL}/movies/${editingMovie._id}`,
          dataToSend,
          config
        );
      } else {
        response = await axios.post(`${API_URL}/movies/create`, dataToSend, config);
      }

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        setEditingMovie(null);
        setErrors({});
        setFormData({
          title: "",
          description: "",
          duration: "",
          genre: "",
          director: "",
          cast: "",
          releaseDate: "",
          poster: "",
          trailerUrl: "",
          rating: "",
        });
        fetchMovies();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phim này?")) return;

    try {
      const response = await axios.delete(`${API_URL}/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        alert(response.data.message);
        fetchMovies();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setErrors({});
    setFormData({
      title: movie.title,
      description: movie.description || "",
      duration: movie.duration,
      genre: movie.genre?.join(", ") || "",
      director: movie.director || "",
      cast: movie.cast?.join(", ") || "",
      releaseDate: movie.releaseDate?.split("T")[0] || "",
      poster: movie.poster || "",
      trailerUrl: movie.trailerUrl || "",
      rating: movie.rating || "",
    });
    setShowModal(true);
  };

  if (loading)
    return <div className="loading text-center mt-5">Đang tải...</div>;

  return (
    <div className="admin-movie-container">
      <div className="admin-header">
        <h1>🎬 Quản Lý Phim</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Thêm Phim Mới
        </button>
      </div>

      <div className="admin-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Poster</th>
              <th>Tên Phim</th>
              <th>Thời lượng</th>
              <th>Thể loại</th>
              <th>Ngày phát hành</th>
              <th>Trailer</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie, index) => (
              <tr key={movie._id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={
                      movie.poster ||
                      "https://via.placeholder.com/50x75?text=No"
                    }
                    alt={movie.title}
                    style={{ width: "50px", height: "75px", objectFit: "cover" }}
                  />
                </td>
                <td>{movie.title}</td>
                <td>{movie.duration} phút</td>
                <td>{movie.genre?.join(", ") || "-"}</td>
                <td>
                  {movie.releaseDate
                    ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
                    : "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {movie.trailerUrl ? "🎬 Có" : "❌ Không"}
                </td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => handleEdit(movie)}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "var(--error-color)",
                      padding: "0.25rem 0.5rem",
                    }}
                    onClick={() => handleDelete(movie._id)}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMovie ? "Sửa Phim" : "Thêm Phim Mới"}</h2>
            
            {/* Hiển thị tóm tắt lỗi nếu có */}
            {Object.keys(errors).length > 0 && (
              <div className="error-summary">
                <strong>⚠️ Vui lòng kiểm tra các lỗi sau:</strong>
                <ul>
                  {Object.values(errors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên phim *</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? "error" : ""}`}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    clearFieldError("title");
                  }}
                  required
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <small style={{ color: "var(--text-secondary)" }}>💡 Có thể để trống</small>
              </div>

              <div className="form-group">
                <label>Thời lượng (phút) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.duration ? "error" : ""}`}
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData({ ...formData, duration: e.target.value });
                    clearFieldError("duration");
                  }}
                  min="1"
                  step="1"
                  required
                />
                {errors.duration && <span className="error-text">{errors.duration}</span>}
              </div>

              <div className="form-group">
                <label>Thể loại (cách nhau bằng dấu phẩy) *</label>
                <input
                  type="text"
                  className={`form-control ${errors.genre ? "error" : ""}`}
                  value={formData.genre}
                  onChange={handleGenreChange}
                  placeholder="Ví dụ: Hành động, Hài, Tình cảm"
                />
                {errors.genre && <span className="error-text">{errors.genre}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  💡 Nhập các thể loại, cách nhau bằng dấu phẩy
                </small>
              </div>

              <div className="form-group">
                <label>Đạo diễn *</label>
                <input
                  type="text"
                  className={`form-control ${errors.director ? "error" : ""}`}
                  value={formData.director}
                  onChange={(e) => {
                    setFormData({ ...formData, director: e.target.value });
                    clearFieldError("director");
                  }}
                />
                {errors.director && <span className="error-text">{errors.director}</span>}
              </div>

              <div className="form-group">
                <label>Diễn viên (cách nhau bằng dấu phẩy) *</label>
                <input
                  type="text"
                  className={`form-control ${errors.cast ? "error" : ""}`}
                  value={formData.cast}
                  onChange={handleCastChange}
                  placeholder="Ví dụ: Ngọc Lan, Trường Giang, Hari Won"
                />
                {errors.cast && <span className="error-text">{errors.cast}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  💡 Nhập các diễn viên, cách nhau bằng dấu phẩy
                </small>
              </div>

              <div className="form-group">
                <label>Ngày phát hành *</label>
                <input
                  type="date"
                  className={`form-control ${errors.releaseDate ? "error" : ""}`}
                  value={formData.releaseDate}
                  onChange={(e) => {
                    setFormData({ ...formData, releaseDate: e.target.value });
                    clearFieldError("releaseDate");
                  }}
                  min={today}
                />
                {errors.releaseDate && <span className="error-text">{errors.releaseDate}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  ⚠️ Chỉ được chọn ngày hiện tại hoặc tương lai
                </small>
              </div>

              <div className="form-group">
                <label>URL Poster</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.poster}
                  onChange={(e) =>
                    setFormData({ ...formData, poster: e.target.value })
                  }
                  placeholder="https://example.com/poster.jpg"
                />
                <small style={{ color: "var(--text-secondary)" }}>
                  💡 Dán link ảnh poster (có thể để trống)
                </small>
              </div>

              <div className="form-group">
                <label>URL Trailer (YouTube)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.trailerUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, trailerUrl: e.target.value })
                  }
                  placeholder="https://www.youtube.com/watch?v=xxxxx"
                />
                <small style={{ color: "var(--text-secondary)" }}>
                  🎬 Dán link YouTube (có thể để trống)
                </small>
              </div>

              <div className="form-group">
                <label>Đánh giá (0.0 - 10.0) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className={`form-control ${errors.rating ? "error" : ""}`}
                  value={formData.rating}
                  onChange={(e) => {
                    let value = parseFloat(e.target.value);
                    if (value < 0) value = 0;
                    if (value > 10) value = 10;
                    setFormData({ ...formData, rating: value });
                    clearFieldError("rating");
                  }}
                />
                {errors.rating && <span className="error-text">{errors.rating}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  ⚠️ Chỉ từ 0.0 đến 10.0
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    setErrors({});
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMovie ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieAdmin;