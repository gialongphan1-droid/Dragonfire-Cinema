import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Home = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies`);
      if (response.data.success) {
        setMovies(response.data.data.slice(0, 8));
      }
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "🎬", title: "Phim Mới Nhất", desc: "Cập nhật phim hot nhất" },
    { icon: "🍿", title: "Combo Bắp Nước", desc: "Ưu đãi hấp dẫn" },
    { icon: "💺", title: "Đặt Vé Dễ Dàng", desc: "Chọn ghế online" },
    { icon: "⭐", title: "Tích Điểm Thưởng", desc: "Nhận nhiều ưu đãi" },
  ];

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">DRAGONFIRE CINEMA</h1>
        <p className="hero-subtitle">
          Trải nghiệm điện ảnh đẳng cấp với những bộ phim bom tấn nhất
        </p>
        <button className="btn btn-primary" onClick={() => navigate("/movies")}>
          Xem Phim Ngay
        </button>
      </div>

      <div className="container">
        <h2 className="section-title">🎬 Phim Đang Chiếu</h2>
        {loading ? (
          <div className="loading text-center">Đang tải phim...</div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="movie-card"
                onClick={() => navigate(`/movies/${movie._id}`)}
              >
                <img
                  src={movie.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
                  alt={movie.title}
                  className="movie-poster"
                />
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-duration">⏱️ {movie.duration} phút</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container">
        <h2 className="section-title">✨ Tại Sao Chọn Chúng Tôi?</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;