import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const MovieList = () => {
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
        setMovies(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải phim:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải phim...</div>;
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h1 className="section-title">🎬 Tất Cả Phim</h1>
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
              <p className="movie-duration">
                🎭 {movie.genre?.join(", ") || "Chưa cập nhật"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieList;