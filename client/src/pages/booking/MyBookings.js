import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const MyBookings = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [cancellingId, setCancellingId] = useState(null);
	const token = localStorage.getItem("accessToken");
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const isAdmin = user.role === "admin";

	useEffect(() => {
		if (!token) {
			alert("Vui lòng đăng nhập!");
			navigate("/login");
			return;
		}

		const fetchBookings = async () => {
			setLoading(true);
			try {
				const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.data.success) {
					setBookings(response.data.data);
				}
			} catch (error) {
				console.error("Lỗi tải lịch sử:", error);
				alert("Có lỗi xảy ra khi tải lịch sử đặt vé!");
			} finally {
				setLoading(false);
			}
		};
		fetchBookings();
	}, [token, navigate]);

	const handleCancelBooking = async (bookingId) => {
		if (!window.confirm("Bạn có chắc muốn hủy đặt vé này?")) return;

		setCancellingId(bookingId);
		try {
			const response = await axios.delete(
				`${API_URL}/bookings/cancel-booking/${bookingId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.data.success) {
				alert("Hủy đặt vé thành công!");
				setBookings(bookings.filter((b) => b._id !== bookingId));
			} else {
				alert(response.data.message);
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setCancellingId(null);
		}
	};

	const formatPrice = (price) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price);
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "pending":
				return <span className="status-badge pending">Chờ thanh toán</span>;
			case "completed":
				return <span className="status-badge completed">Đã thanh toán</span>;
			case "cancelled":
				return <span className="status-badge cancelled">Đã hủy</span>;
			default:
				return <span className="status-badge">{status}</span>;
		}
	};

	if (loading) {
		return (
			<div className="loading text-center mt-5">Đang tải lịch sử đặt vé...</div>
		);
	}

	if (bookings.length === 0) {
		return (
			<div className="my-bookings-empty">
				<div className="container">
					<h2>Lịch Sử Đặt Vé</h2>
					<p>Bạn chưa có đặt vé nào.</p>
					<button
						className="btn btn-primary"
						onClick={() => navigate("/showtimes")}
					>
						Đặt vé ngay
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="my-bookings-container">
			<div className="container">
				<h1 className="section-title">Lịch Sử Đặt Vé</h1>

				<div className="bookings-list">
					{bookings.map((booking) => {
						const movie = booking.showtimeId?.movieId;
						const posterUrl =
							movie?.poster ||
							"https://via.placeholder.com/80x120?text=No+Poster";

						return (
							<div
								key={booking._id}
								className={`booking-card ${booking.status}`}
							>
								{/* Poster */}
								<div className="booking-poster">
									<img
										src={posterUrl}
										alt={movie?.title || "Phim"}
										onError={(e) => {
											e.target.src =
												"https://via.placeholder.com/80x120?text=No+Poster";
										}}
									/>
								</div>

								{/* Thông tin */}
								<div className="booking-info">
									<div className="booking-header">
										<h3>{movie?.title || "Không xác định"}</h3>
										{getStatusBadge(booking.status)}
									</div>

									<div className="booking-details">
										<div className="detail-row">
											<span className="detail-label">📅 Ngày:</span>
											<span className="detail-value">
												{formatDate(booking.showtimeId?.date)}
											</span>
										</div>
										<div className="detail-row">
											<span className="detail-label">⏰ Giờ:</span>
											<span className="detail-value">
												{booking.showtimeId?.time || "---"}
											</span>
										</div>
										<div className="detail-row">
											<span className="detail-label">🏠 Rạp:</span>
											<span className="detail-value">
												{booking.showtimeId?.room || "---"}
											</span>
										</div>
										<div className="detail-row">
											<span className="detail-label">💺 Ghế:</span>
											<span className="detail-value">
												{booking.seats?.join(", ") || "---"}
											</span>
										</div>
										<div className="detail-row">
											<span className="detail-label">💰 Tiền:</span>
											<span className="detail-value price">
												{formatPrice(booking.totalAmount)}
											</span>
										</div>
										<div className="detail-row">
											<span className="detail-label">🎫 Mã vé:</span>
											<span className="detail-value ticket-code">
												{booking.ticketCode}
											</span>
										</div>

										{/* Admin: hiển thị người đặt */}
										{isAdmin && booking.userId && (
											<div className="detail-row user-info">
												<span className="detail-label">👤 Người đặt:</span>
												<span className="detail-value">
													{booking.userId.name}
												</span>
											</div>
										)}
									</div>

									<div className="booking-footer">
										<span className="booking-date">
											📅 Đặt lúc:{" "}
											{new Date(booking.createdAt).toLocaleString("vi-VN")}
										</span>
										{booking.status === "pending" && (
											<button
												className="btn-cancel"
												onClick={() => handleCancelBooking(booking._id)}
												disabled={cancellingId === booking._id}
											>
												{cancellingId === booking._id
													? "Đang xử lý..."
													: "Hủy vé"}
											</button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default MyBookings;
