import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Hàm lấy ID video từ URL YouTube
const getYouTubeId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetchMovieDetail();
  }, [id]);

  const fetchMovieDetail = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies/${id}`);
      if (response.data.success) {
        setMovie(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết phim:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchTrailer = () => {
    setShowTrailer(true);
  };

  const handleCloseTrailer = () => {
    setShowTrailer(false);
  };

  const videoId = movie?.trailerUrl ? getYouTubeId(movie.trailerUrl) : null;

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải...</div>;
  }

  if (!movie) {
    return <div className="text-center mt-5">Không tìm thấy phim</div>;
  }

  return (
    <div className="movie-detail-container">
      <button className="btn btn-outline mb-3" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="movie-detail-content">
        <img
          src={movie.poster || "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="movie-detail-poster"
        />

        <div className="movie-detail-info">
          <h1>{movie.title}</h1>

          <div className="movie-meta">
            <span>⭐ {movie.rating || "Chưa đánh giá"}</span>
            <span>⏱️ {movie.duration} phút</span>
            <span>
              📅{" "}
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
                : "Sắp chiếu"}
            </span>
          </div>

          <div className="movie-meta">
            <span>🎭 Thể loại: {movie.genre?.join(", ") || "Chưa cập nhật"}</span>
          </div>

          <div className="movie-description">
            <h3>Nội dung phim</h3>
            <p>{movie.description || "Chưa có mô tả"}</p>
          </div>

          <div className="movie-cast">
            <h3>Diễn viên</h3>
            <p>{movie.cast?.join(", ") || "Chưa cập nhật"}</p>
          </div>

          <div className="movie-cast">
            <h3>Đạo diễn</h3>
            <p>{movie.director || "Chưa cập nhật"}</p>
          </div>

          <div className="movie-buttons" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/showtimes?movie=${movie._id}`)}
            >
              🎫 Đặt Vé Ngay
            </button>
            
            {/* Nút xem trailer - chỉ hiển thị nếu có trailer */}
            {videoId && (
              <button
                className="btn btn-outline"
                onClick={handleWatchTrailer}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                ▶ Xem Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal xem trailer */}
      {showTrailer && videoId && (
        <div className="modal-overlay" onClick={handleCloseTrailer}>
          <div className="trailer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={handleCloseTrailer}>
              ✕
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;