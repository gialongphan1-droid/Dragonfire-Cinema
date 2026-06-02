import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const MovieAdmin = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    genre: [],
    director: "",
    cast: [],
    releaseDate: "",
    poster: "",
    rating: "",
  });

  const token = localStorage.getItem("token");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let response;

      if (editingMovie) {
        response = await axios.put(
          `${API_URL}/movies/${editingMovie._id}`,
          formData,
          config
        );
      } else {
        response = await axios.post(`${API_URL}/movies/create`, formData, config);
      }

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        setEditingMovie(null);
        setFormData({
          title: "",
          description: "",
          duration: "",
          genre: [],
          director: "",
          cast: [],
          releaseDate: "",
          poster: "",
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
    setFormData({
      title: movie.title,
      description: movie.description || "",
      duration: movie.duration,
      genre: movie.genre || [],
      director: movie.director || "",
      cast: movie.cast || [],
      releaseDate: movie.releaseDate?.split("T")[0] || "",
      poster: movie.poster || "",
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
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Poster</th>
              <th>Tên Phim</th>
              <th>Thời lượng</th>
              <th>Thể loại</th>
              <th>Ngày phát hành</th>
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên phim *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
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
              </div>

              <div className="form-group">
                <label>Thời lượng (phút) *</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Thể loại (cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.genre.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      genre: e.target.value.split(",").map((g) => g.trim()).filter((g) => g),
                    })
                  }
                  placeholder="Hành động, Hài, Tình cảm"
                />
              </div>

              <div className="form-group">
                <label>Đạo diễn</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.director}
                  onChange={(e) =>
                    setFormData({ ...formData, director: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Diễn viên (cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.cast.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cast: e.target.value.split(",").map((c) => c.trim()).filter((c) => c),
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Ngày phát hành</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.releaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
                />
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
              </div>

              <div className="form-group">
                <label>Đánh giá (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
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