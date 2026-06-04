import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ShowtimeAdmin = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]); // ✅ THÊM STATE CHO ROOMS
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",        // ✅ ĐỔI room THÀNH roomId
    roomName: "",      // ✅ THÊM roomName
    date: "",
    time: "",
    price: ""
  });
  const [errors, setErrors] = useState({});
  const [serverTime, setServerTime] = useState(null);

  const token = localStorage.getItem("token");
  const today = new Date().toISOString().split("T")[0];

  // Lấy thời gian thực từ server
  useEffect(() => {
    fetchServerTime();
  }, []);

  // Lấy danh sách phòng
  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
  }, []);

  const fetchServerTime = async () => {
    try {
      const response = await axios.get(`${API_URL}/current-time`);
      if (response.data.success) {
        setServerTime(new Date(response.data.currentTime));
      }
    } catch (err) {
      console.error("Lỗi lấy thời gian server:", err);
      setServerTime(new Date());
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      if (response.data.success) {
        setRooms(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get(`${API_URL}/showtimes`);
      if (response.data.success) {
        setShowtimes(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải suất chiếu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies`);
      if (response.data.success) {
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    }
  };

  // Kiểm tra thời gian có hợp lệ không (dùng server time)
  const isValidDateTime = (date, time) => {
    if (!date || !time) return false;
    const dateTimeString = `${date}T${time}:00`;
    const selectedDateTime = new Date(dateTimeString);
    const now = serverTime || new Date();
    return selectedDateTime > now;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.movieId) newErrors.movieId = "Vui lòng chọn phim!";
    if (!formData.roomId) newErrors.roomId = "Vui lòng chọn phòng chiếu!";
    if (!formData.date) newErrors.date = "Vui lòng chọn ngày chiếu!";
    if (!formData.time) newErrors.time = "Vui lòng chọn giờ chiếu!";
    if (!formData.price || formData.price < 50000) {
      newErrors.price = "Giá vé phải từ 50,000đ trở lên!";
    }
    
    if (formData.date && formData.time && !isValidDateTime(formData.date, formData.time)) {
      newErrors.time = "❌ Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // ✅ TẠO PAYLOAD ĐÚNG VỚI BACKEND
      const payload = {
        movieId: formData.movieId,
        cinemaName: "Dragonfire Cinema",           // ← THÊM cinemaName
        roomId: formData.roomId,                   // ← roomId từ database
        startTime: new Date(`${formData.date}T${formData.time}:00`).toISOString(),
        price: parseInt(formData.price),
        seats: []
      };

      console.log("📦 Payload gửi đi:", payload);

      let response;
      if (editingShowtime) {
        response = await axios.put(
          `${API_URL}/showtimes/${editingShowtime._id}`,
          payload,
          config
        );
      } else {
        response = await axios.post(`${API_URL}/showtimes`, payload, config);
      }

      if (response.data.success) {
        alert(response.data.message);
        setShowModal(false);
        setEditingShowtime(null);
        setFormData({ movieId: "", roomId: "", roomName: "", date: "", time: "", price: "" });
        fetchShowtimes();
      }
    } catch (error) {
      console.error("❌ Lỗi chi tiết:", error.response?.data);
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa suất chiếu này?")) return;
    try {
      const response = await axios.delete(`${API_URL}/showtimes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        alert(response.data.message);
        fetchShowtimes();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setFormData({
      movieId: showtime.movieId?._id || "",
      roomId: showtime.roomId?._id || "",
      roomName: showtime.roomName || "",
      date: showtime.startTime ? new Date(showtime.startTime).toISOString().split("T")[0] : "",
      time: showtime.startTime ? new Date(showtime.startTime).toTimeString().slice(0, 5) : "",
      price: showtime.price || ""
    });
    setShowModal(true);
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  if (loading) return <div className="loading text-center mt-5">Đang tải...</div>;

  return (
    <div className="admin-showtime-container">
      <div className="admin-header">
        <h1>🎬 Quản Lý Suất Chiếu</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Thêm Suất Chiếu
        </button>
      </div>

      <div className="admin-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Phim</th>
              <th>Phòng chiếu</th>
              <th>Ngày chiếu</th>
              <th>Giờ chiếu</th>
              <th>Giá vé</th>
              <th>Ghế trống</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((st, index) => (
              <tr key={st._id}>
                <td>{index + 1}</td>
                <td>{st.movieId?.title || "Không xác định"}</td>
                <td>{st.roomName}</td>
                <td>{st.startTime ? new Date(st.startTime).toLocaleDateString("vi-VN") : "Chưa có ngày"}</td>
                <td>{st.startTime ? new Date(st.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Chưa có giờ"}</td>
                <td>{formatCurrency(st.price)}</td>
                <td>{(st.availableSeats || 100) - (st.bookedSeats?.length || 0)}/{st.availableSeats || 100}</td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
                    onClick={() => handleEdit(st)}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn"
                    style={{ background: "var(--error-color)", padding: "0.25rem 0.5rem" }}
                    onClick={() => handleDelete(st._id)}
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
            <h2>{editingShowtime ? "Sửa Suất Chiếu" : "Thêm Suất Chiếu Mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Chọn phim *</label>
                <select
                  className={`form-control ${errors.movieId ? "error" : ""}`}
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map(movie => (
                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                  ))}
                </select>
                {errors.movieId && <span className="error-text">{errors.movieId}</span>}
              </div>

              <div className="form-group">
                <label>Phòng chiếu *</label>
                <select
                  className={`form-control ${errors.roomId ? "error" : ""}`}
                  value={formData.roomId}
                  onChange={(e) => {
                    const selectedRoom = rooms.find(r => r._id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      roomId: selectedRoom?._id || "",
                      roomName: selectedRoom?.name || ""
                    });
                  }}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.name} ({room.type}) - {room.status === "active" ? "✅ Hoạt động" : "🔧 Bảo trì"}
                    </option>
                  ))}
                </select>
                {errors.roomId && <span className="error-text">{errors.roomId}</span>}
              </div>

              <div className="form-group">
                <label>Ngày chiếu *</label>
                <input
                  type="date"
                  className={`form-control ${errors.date ? "error" : ""}`}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={today}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label>Giờ chiếu *</label>
                <input
                  type="time"
                  className={`form-control ${errors.time ? "error" : ""}`}
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  step="1800"
                />
                {errors.time && <span className="error-text">{errors.time}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  💡 Khung giờ: 09:00, 11:30, 13:00, 14:15, 16:00, 18:30, 20:00, 22:15
                </small>
              </div>

              <div className="form-group">
                <label>Giá vé (VNĐ) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? "error" : ""}`}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  min="50000"
                  step="10000"
                  placeholder="50,000"
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
                <small style={{ color: "var(--text-secondary)" }}>
                  💡 Giá tối thiểu: 50,000đ
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingShowtime ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeAdmin;