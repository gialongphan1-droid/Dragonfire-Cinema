import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Home = () => {
	const navigate = useNavigate();
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});

	useEffect(() => {
		fetchMovies();
	}, [pagination.currentPage]);

	const fetchMovies = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${API_URL}/movies/home`, {
				params: {
					page: pagination.currentPage,
					limit: 5,
				},
			});
			if (response.data.success) {
				setMovies(response.data.data.movies);
				setPagination(response.data.data.pagination);
			}
		} catch (error) {
			console.error("Lỗi tải phim:", error);
		} finally {
			setLoading(false);
		}
	};

	const goToPage = (page) => {
		if (page >= 1 && page <= pagination.totalPages) {
			setPagination((prev) => ({ ...prev, currentPage: page }));
			// ✅ XÓA DÒNG NÀY - không cuộn lên đầu
			// window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const handlePrevPage = () => {
		if (pagination.hasPrevPage) {
			goToPage(pagination.currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (pagination.hasNextPage) {
			goToPage(pagination.currentPage + 1);
		}
	};

	// Thêm useEffect để lưu và khôi phục vị trí cuộn
	const scrollPositionRef = React.useRef(0);

	useEffect(() => {
		// Lưu vị trí trước khi fetch dữ liệu mới
		scrollPositionRef.current = window.scrollY;
	}, [pagination.currentPage]);

	useEffect(() => {
		// Khôi phục vị trí sau khi fetch xong
		if (!loading && scrollPositionRef.current > 0) {
			window.scrollTo(0, scrollPositionRef.current);
		}
	}, [loading]);

	if (loading) {
		return <div className="loading text-center mt-5">Đang tải phim...</div>;
	}

	return (
		<div className="homepage-container">
			<main className="homepage-main">
				{/* Hero Section */}
				<section className="hero-section">
					<div className="hero-content">
						<h1 className="hero-title">DRAGONFIRE CINEMA</h1>
						<p className="hero-subtitle">
							Trải nghiệm điện ảnh đẳng cấp với công nghệ âm thanh và hình ảnh
							sống động nhất
						</p>
						<div className="hero-buttons">
							<button
								className="hero-btn-primary"
								onClick={() => navigate("/movies")}
							>
								Đặt vé ngay
							</button>
							<button
								className="hero-btn-secondary"
								onClick={() => navigate("/register")}
							>
								Đăng ký thành viên
							</button>
						</div>
					</div>
				</section>

				{/* Phim đang chiếu */}
				<section className="movies-section">
					<div className="section-container">
						<h2 className="section-title">PHIM ĐANG CHIẾU</h2>

						{movies.length === 0 ? (
							<div className="no-results-home">
								<p>Không có phim nào!</p>
							</div>
						) : (
							<>
								<div className="movie-grid">
									{movies.map((movie) => (
										<div
											key={movie._id}
											className="movie-card"
											onClick={() => navigate(`/movies/${movie._id}`)}
										>
											<img
												src={
													movie.poster ||
													"https://via.placeholder.com/300x450/333/666?text=No+Poster"
												}
												alt={movie.title}
												className="movie-poster"
											/>
											<div className="movie-info">
												<h3 className="movie-title">{movie.title}</h3>
												<p className="movie-duration">
													⏱️ {movie.duration} phút
												</p>
												<p className="movie-genre">
													🎭{" "}
													{movie.genre?.slice(0, 2).join(", ") ||
														"Chưa cập nhật"}
												</p>
											</div>
										</div>
									))}
								</div>

								{/* Phân trang */}
								{pagination.totalPages > 1 && (
									<div className="pagination">
										<button
											className="pagination-btn"
											onClick={handlePrevPage}
											disabled={!pagination.hasPrevPage}
										>
											◀ Trang trước
										</button>

										<span className="pagination-info">
											Trang {pagination.currentPage} / {pagination.totalPages}
										</span>

										<button
											className="pagination-btn"
											onClick={handleNextPage}
											disabled={!pagination.hasNextPage}
										>
											Trang sau ▶
										</button>
									</div>
								)}

								<div className="section-footer">
									<button
										className="view-all-link"
										onClick={() => navigate("/movies")}
									>
										Xem tất cả phim →
									</button>
								</div>
							</>
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
								<p>
									Giảm ngay 20% cho vé xem phim đầu tiên khi đăng ký tài khoản
								</p>
								<button
									className="promotion-link"
									onClick={() => navigate("/register")}
								>
									Đăng ký ngay →
								</button>
							</div>
							<div className="promotion-card">
								<div className="promotion-icon">⭐</div>
								<h3>TÍCH ĐIỂM VIP</h3>
								<p>
									1 điểm = 1,000đ. Tích lũy điểm để đổi vé, bắp nước và quà tặng
								</p>
								<button
									className="promotion-link"
									onClick={() => navigate("/login")}
								>
									Xem chi tiết →
								</button>
							</div>
							<div className="promotion-card">
								<div className="promotion-icon">🎫</div>
								<h3>COMBO CUỐI TUẦN</h3>
								<p>
									Mua 2 vé tặng 1 vé, áp dụng cho tất cả suất chiếu thứ 7, Chủ
									nhật
								</p>
								<button
									className="promotion-link"
									onClick={() => navigate("/showtimes")}
								>
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
								<button
									className="service-link"
									onClick={() => navigate("/products")}
								>
									Đặt ngay →
								</button>
							</div>
							<div className="service-card">
								<div className="service-icon">🎂</div>
								<h3>TIỆC SINH NHẬT</h3>
								<p>Tổ chức sinh nhật tại rạp với ưu đãi đặc biệt</p>
								<button
									className="service-link"
									onClick={() => navigate("/contact")}
								>
									Liên hệ →
								</button>
							</div>
							<div className="service-card">
								<div className="service-icon">🚗</div>
								<h3>BÃI ĐỖ XE</h3>
								<p>Miễn phí đỗ xe cho tất cả khách hàng</p>
								<button
									className="service-link"
									onClick={() => navigate("/location")}
								>
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