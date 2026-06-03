import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ShowtimeList = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);

  // Lấy ngày hôm nay
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
  }, []);

  useEffect(() => {
    filterShowtimes();
  }, [selectedMovie, selectedDate, showtimes]);

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get(`${API_URL}/showtimes`);
      if (response.data.success) {
        setShowtimes(response.data.data);
        setFilteredShowtimes(response.data.data);
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

  const filterShowtimes = () => {
    let filtered = [...showtimes];

    if (selectedMovie) {
      filtered = filtered.filter(st => st.movieId?._id === selectedMovie);
    }

    if (selectedDate) {
      filtered = filtered.filter(st => {
        // Kiểm tra date có tồn tại không
        if (!st.date) return false;
        try {
          const showDate = new Date(st.date).toISOString().split("T")[0];
          return showDate === selectedDate;
        } catch (error) {
          console.error("Lỗi parse date:", st.date);
          return false;
        }
      });
    }

    setFilteredShowtimes(filtered);
  };

  const clearFilters = () => {
    setSelectedMovie("");
    setSelectedDate("");
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có ngày";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải suất chiếu...</div>;
  }

  return (
    <div className="showtime-list-container">
      <div className="container">
        <h1 className="section-title">🎬 LỊCH CHIẾU PHIM</h1>

        {/* Bộ lọc */}
        <div className="filter-section">
          <div className="filter-group">
            <label>Chọn phim:</label>
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả phim</option>
              {movies.map(movie => (
                <option key={movie._id} value={movie._id}>{movie.title}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Chọn ngày:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-date"
              min={today}
            />
          </div>

          {(selectedMovie || selectedDate) && (
            <button className="btn btn-outline" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Kết quả */}
        {filteredShowtimes.length === 0 ? (
          <div className="no-results-home">
            <p>🎬 Không tìm thấy suất chiếu nào!</p>
            <p className="no-results-suggestion">Hãy thử chọn phim hoặc ngày khác nhé!</p>
          </div>
        ) : (
          <div className="showtimes-list">
            {filteredShowtimes.map((showtime) => (
              <div key={showtime._id} className="showtime-card-large">
                <div className="showtime-movie-poster">
                  <img
                    src={showtime.movieId?.poster || "https://via.placeholder.com/100x150?text=No+Poster"}
                    alt={showtime.movieId?.title}
                  />
                </div>
                <div className="showtime-info-large">
                  <h3 className="showtime-movie-title">{showtime.movieId?.title || "Không xác định"}</h3>
                  <div className="showtime-movie-meta">
                    <span>⭐ {showtime.movieId?.rating || "Chưa đánh giá"}</span>
                    <span>⏱️ {showtime.movieId?.duration || 0} phút</span>
                    <span>🎭 {showtime.movieId?.genre?.slice(0, 2).join(", ") || "Chưa cập nhật"}</span>
                  </div>
                  <div className="showtime-detail">
                    <div className="showtime-room">
                      <span>🏠 {showtime.room || "Chưa có phòng"}</span>
                    </div>
                    <div className="showtime-datetime">
                      <span>📅 {formatDate(showtime.date)}</span>
                      <span>⏰ {showtime.time || "Chưa có giờ"}</span>
                    </div>
                    <div className="showtime-price">
                      <span>💰 {formatCurrency(showtime.price || 0)}</span>
                    </div>
                    <div className="showtime-seats-left">
                      <span className={(showtime.availableSeats - (showtime.bookedSeats?.length || 0)) <= 10 ? "seats-low" : "seats-available"}>
                        🪑 Còn {(showtime.availableSeats || 100) - (showtime.bookedSeats?.length || 0)}/{(showtime.availableSeats || 100)} ghế
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary booking-btn"
                    onClick={() => navigate(`/booking?showtime=${showtime._id}`)}
                  >
                    🎫 Đặt Vé Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimeList;