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
  const [serverTime, setServerTime] = useState(null);

  // Lấy thời gian thực từ server
  useEffect(() => {
    fetchServerTime();
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

  const today = serverTime ? new Date(serverTime).toISOString().split("T")[0] : "";

  useEffect(() => {
    if (serverTime) {
      fetchShowtimes();
      fetchMovies();
    }
  }, [serverTime]);

  useEffect(() => {
    filterShowtimes();
  }, [selectedMovie, selectedDate, showtimes]);

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get(`${API_URL}/showtimes`);
      if (response.data.success) {
        // ✅ CHUẨN HÓA DỮ LIỆU: hỗ trợ cả cấu trúc cũ và mới
        const normalizedShowtimes = response.data.data.map(st => {
          // Lấy thời gian chiếu (ưu tiên startTime mới, nếu không thì dùng date + time cũ)
          let showDateTime;
          let roomName;
          
          if (st.startTime) {
            // Cấu trúc mới
            showDateTime = new Date(st.startTime);
            roomName = st.roomName || st.room;
          } else if (st.date && st.time) {
            // Cấu trúc cũ
            showDateTime = new Date(`${st.date}T${st.time}`);
            roomName = st.room;
          } else {
            showDateTime = new Date();
            roomName = "Chưa có phòng";
          }
          
          return {
            _id: st._id,
            movieId: st.movieId,
            room: roomName,
            dateTime: showDateTime,
            date: showDateTime,
            price: st.price,
            availableSeats: st.availableSeats || 100,
            bookedSeats: st.bookedSeats || []
          };
        });
        
        // Lọc suất chiếu trong tương lai
        const futureShowtimes = normalizedShowtimes.filter(st => st.dateTime > serverTime);
        setShowtimes(futureShowtimes);
        setFilteredShowtimes(futureShowtimes);
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
        if (!st.date) return false;
        try {
          const showDate = new Date(st.date).toISOString().split("T")[0];
          return showDate === selectedDate;
        } catch (error) {
          return false;
        }
      });
    }

    filtered.sort((a, b) => a.dateTime - b.dateTime);
    setFilteredShowtimes(filtered);
  };

  const clearFilters = () => {
    setSelectedMovie("");
    setSelectedDate("");
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "Chưa có ngày";
    try {
      return new Date(dateObj).toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return "Chưa có giờ";
    try {
      return new Date(dateObj).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Giờ không hợp lệ";
    }
  };

  const isStillValid = (dateTime) => {
    if (!serverTime) return true;
    return dateTime > serverTime;
  };

  const groupShowtimesByMovie = () => {
    const grouped = {};
    filteredShowtimes.forEach(showtime => {
      const movieId = showtime.movieId?._id;
      if (!movieId) return;
      
      if (!grouped[movieId]) {
        grouped[movieId] = {
          movie: showtime.movieId,
          showtimes: []
        };
      }
      
      const isValid = isStillValid(showtime.dateTime);
      
      grouped[movieId].showtimes.push({
        id: showtime._id,
        time: formatTime(showtime.dateTime),
        date: formatDate(showtime.dateTime),
        fullDate: showtime.dateTime,
        room: showtime.room,
        price: showtime.price,
        availableSeats: (showtime.availableSeats || 100) - (showtime.bookedSeats?.length || 0),
        totalSeats: showtime.availableSeats || 100,
        isValid: isValid
      });
      
      grouped[movieId].showtimes.sort((a, b) => a.fullDate - b.fullDate);
    });
    return grouped;
  };

  const groupedShowtimes = groupShowtimesByMovie();

  if (loading || !serverTime) {
    return <div className="loading text-center mt-5">Đang tải suất chiếu...</div>;
  }

  return (
    <div className="showtime-list-container">
      <div className="container">
        <h1 className="section-title">🎬 LỊCH CHIẾU PHIM</h1>

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

        {Object.keys(groupedShowtimes).length === 0 ? (
          <div className="no-results-home">
            <p>🎬 Không tìm thấy suất chiếu nào!</p>
            <p className="no-results-suggestion">Hãy thử chọn phim hoặc ngày khác nhé!</p>
          </div>
        ) : (
          <div className="showtimes-list">
            {Object.keys(groupedShowtimes).map((movieId) => {
              const group = groupedShowtimes[movieId];
              const movie = group.movie;
              const movieShowtimes = group.showtimes;
              
              return (
                <div key={movieId} className="movie-showtime-group">
                  <div className="movie-group-header">
                    <img
                      src={movie?.poster || "https://via.placeholder.com/80x120?text=No+Poster"}
                      alt={movie?.title}
                      className="movie-group-poster"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x120?text=No+Poster";
                      }}
                    />
                    <div className="movie-group-info">
                      <h2 className="movie-group-title">{movie?.title || "Không xác định"}</h2>
                      <div className="movie-group-meta">
                        <span>⭐ {movie?.rating || "Chưa đánh giá"}</span>
                        <span>⏱️ {movie?.duration || 0} phút</span>
                        <span>🎭 {movie?.genre?.slice(0, 2).join(", ") || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="showtimes-group">
                    <h3 className="showtimes-group-title">📅 CÁC SUẤT CHIẾU</h3>
                    <div className="showtimes-group-grid">
                      {movieShowtimes.map((showtime, idx) => (
                        <div 
                          key={idx}
                          className={`showtime-group-card ${!showtime.isValid ? "expired-showtime" : ""}`}
                          onClick={() => {
                            if (showtime.isValid) {
                              navigate(`/booking?showtime=${showtime.id}`);
                            } else {
                              alert("❌ Suất chiếu này đã qua thời gian! Không thể đặt vé.");
                            }
                          }}
                          style={!showtime.isValid ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                        >
                          <div className="showtime-group-time">{showtime.time}</div>
                          <div className="showtime-group-date">{showtime.date}</div>
                          <div className="showtime-group-room">{showtime.room}</div>
                          <div className="showtime-group-price">{formatCurrency(showtime.price)}</div>
                          <div className={`showtime-group-seats ${showtime.availableSeats <= 10 ? "seats-low" : ""}`}>
                            🪑 Còn {showtime.availableSeats}/{showtime.totalSeats} ghế
                          </div>
                          {!showtime.isValid && (
                            <div className="expired-badge">Hết hạn</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimeList;