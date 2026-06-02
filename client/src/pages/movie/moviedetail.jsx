import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../../services/movieApi';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetail();
  }, [id]);

  const fetchMovieDetail = async () => {
    try {
      const response = await movieService.getMovieById(id);
      setMovie(response.data.data || response.data);
    } catch (error) {
      console.error('Lỗi tải chi tiết phim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    navigate(`/booking/${id}`);
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!movie) return <div className="error">Không tìm thấy phim</div>;

  return (
    <div className="movie-detail">
      <div className="detail-backdrop" style={{ backgroundImage: `url(${movie.poster})` }}>
        <div className="overlay"></div>
      </div>
      
      <div className="detail-container">
        <div className="detail-poster">
          <img src={movie.poster || 'https://via.placeholder.com/300x450'} alt={movie.title} />
        </div>
        
        <div className="detail-info">
          <h1>{movie.title}</h1>
          <div className="info-meta">
            <span>⭐ {movie.rating || 'N/A'}</span>
            <span>⏱ {movie.duration} phút</span>
            <span>🎬 {movie.language || 'Tiếng Việt'}</span>
          </div>
          <div className="info-genre">
            {movie.genre?.map((g, idx) => <span key={idx} className="genre-tag">{g}</span>)}
          </div>
          <p className="info-description">{movie.description}</p>
          <div className="info-detail">
            <p><strong>Đạo diễn:</strong> {movie.director || 'Đang cập nhật'}</p>
            <p><strong>Diễn viên:</strong> {movie.cast?.join(', ') || 'Đang cập nhật'}</p>
            <p><strong>Ngày phát hành:</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
            <p><strong>Giá vé:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(movie.price || 75000)}</p>
          </div>
          <button className="btn-booking" onClick={handleBooking}>🎟️ ĐẶT VÉ NGAY</button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;