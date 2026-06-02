import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Home = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      // Dữ liệu mẫu khi chưa có API
      setMovies([
        { _id: "1", title: "Avengers: Doomsday", duration: 148, genre: ["Hành động", "Khoa học viễn tưởng"], poster: null },
        { _id: "2", title: "Lilo & Stitch", duration: 108, genre: ["Hoạt hình", "Gia đình"], poster: null },
        { _id: "3", title: "Mission Impossible 8", duration: 163, genre: ["Hành động", "Gián điệp"], poster: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc phim theo từ khóa tìm kiếm
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="homepage-container">
      <main className="homepage-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">DRAGONFIRE CINEMA</h1>
            <p className="hero-subtitle">
              Trải nghiệm điện ảnh đẳng cấp với công nghệ âm thanh và hình ảnh sống động nhất
            </p>
            <div className="hero-buttons">
              <button className="hero-btn-primary" onClick={() => navigate("/movies")}>
                Đặt vé ngay
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate("/register")}>
                Đăng ký thành viên
              </button>
            </div>
          </div>
        </section>

        {/* Thanh tìm kiếm */}
        <div className="section-container">
          <div className="search-box-home">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input-home"
              placeholder="Tìm kiếm phim theo tên..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button className="search-clear-home" onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Phim đang chiếu */}
        <section className="movies-section">
          <div className="section-container">
            <h2 className="section-title">
              {searchTerm ? `KẾT QUẢ TÌM KIẾM: "${searchTerm}"` : "PHIM ĐANG CHIẾU"}
            </h2>
            
            {loading ? (
              <div className="loading">Đang tải phim...</div>
            ) : filteredMovies.length > 0 ? (
              <>
                <div className="movie-grid">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie._id}
                      className="movie-card"
                      onClick={() => navigate(`/movies/${movie._id}`)}
                    >
                      <img
                        src={movie.poster || "https://via.placeholder.com/300x450/333/666?text=No+Poster"}
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <div className="movie-info">
                        <h3 className="movie-title">{movie.title}</h3>
                        <p className="movie-duration">⏱️ {movie.duration} phút</p>
                        <p className="movie-genre">🎭 {movie.genre?.slice(0, 2).join(", ") || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {!searchTerm && (
                  <div className="section-footer">
                    <button className="view-all-link" onClick={() => navigate("/movies")}>
                      Xem tất cả phim →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results-home">
                <p>Không tìm thấy phim nào phù hợp với từ khóa "{searchTerm}"</p>
                <button className="hero-btn-secondary" onClick={clearSearch}>
                  Xóa tìm kiếm
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Khuyến mãi đặc biệt */}
        <section className="promotion-section">
          <div className="section-container">
            <h2 className="section-title">KHUYẾN MÃI ĐẶC BIỆT</h2>
            <div className="promotion-grid">
              <div className="promotion-card">
                <div className="promotion-icon">🎁</div>
                <h3>THÀNH VIÊN MỚI</h3>
                <p>Giảm ngay 20% cho vé xem phim đầu tiên khi đăng ký tài khoản</p>
                <button className="promotion-link" onClick={() => navigate("/register")}>
                  Đăng ký ngay →
                </button>
              </div>
              <div className="promotion-card">
                <div className="promotion-icon">⭐</div>
                <h3>TÍCH ĐIỂM VIP</h3>
                <p>1 điểm = 1,000đ. Tích lũy điểm để đổi vé, bắp nước và quà tặng</p>
                <button className="promotion-link" onClick={() => navigate("/login")}>
                  Xem chi tiết →
                </button>
              </div>
              <div className="promotion-card">
                <div className="promotion-icon">🎫</div>
                <h3>COMBO CUỐI TUẦN</h3>
                <p>Mua 2 vé tặng 1 vé, áp dụng cho tất cả suất chiếu thứ 7, Chủ nhật</p>
                <button className="promotion-link" onClick={() => navigate("/showtimes")}>
                  Đặt vé ngay →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dịch vụ tiện ích */}
        <section className="services-section">
          <div className="section-container">
            <h2 className="section-title">DỊCH VỤ TIỆN ÍCH</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">🍿</div>
                <h3>BẮP NƯỚC</h3>
                <p>Đa dạng combo, giá tốt, giao tận ghế</p>
                <button className="service-link" onClick={() => navigate("/products")}>
                  Đặt ngay →
                </button>
              </div>
              <div className="service-card">
                <div className="service-icon">🎂</div>
                <h3>TIỆC SINH NHẬT</h3>
                <p>Tổ chức sinh nhật tại rạp với ưu đãi đặc biệt</p>
                <button className="service-link" onClick={() => navigate("/contact")}>
                  Liên hệ →
                </button>
              </div>
              <div className="service-card">
                <div className="service-icon">🚗</div>
                <h3>BÃI ĐỖ XE</h3>
                <p>Miễn phí đỗ xe cho tất cả khách hàng</p>
                <button className="service-link" onClick={() => navigate("/location")}>
                  Xem bản đồ →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;