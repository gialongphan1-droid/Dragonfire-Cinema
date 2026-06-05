import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/showtimes";

const ShowTimeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [showtime, setShowtime] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookingSuccess, setBookingSuccess] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        fetchShowtimeDetail();
        fetchAvailableSeats();
    }, [id]);

    const fetchShowtimeDetail = async () => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            setShowtime(response.data.data);
        } catch (err) {
            console.error("Lỗi:", err);
            setError("Không thể tải thông tin suất chiếu");
        }
    };

    const fetchAvailableSeats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/${id}/seats`);
            setSeats(response.data.data.seats || []);
        } catch (err) {
            console.error("Lỗi:", err);
            setError("Không thể tải sơ đồ ghế");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const handleSeatClick = (seat) => {
        if (seat.isBooked) return;
        
        const isSelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
        
        if (isSelected) {
            setSelectedSeats(selectedSeats.filter(s => s.seatNumber !== seat.seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const getTotalPrice = () => {
        if (!showtime) return 0;
        return selectedSeats.length * showtime.price;
    };

    const handleBooking = async () => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để đặt vé!");
            navigate("/login");
            return;
        }

        if (selectedSeats.length === 0) {
            alert("Vui lòng chọn ít nhất một ghế!");
            return;
        }

        const confirmBooking = window.confirm(
            `Bạn có chắc muốn đặt ${selectedSeats.length} ghế với tổng tiền ${getTotalPrice().toLocaleString()}đ?`
        );

        if (!confirmBooking) return;

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const bookingResponse = await axios.post(
                "http://localhost:5000/api/bookings",
                {
                    showtimeId: id,
                    seats: selectedSeats.map(s => s.seatNumber),
                    totalPrice: getTotalPrice(),
                },
                config
            );

            if (bookingResponse.data.success) {
                setBookingSuccess(`Đặt vé thành công! Mã vé: ${bookingResponse.data.data.bookingCode}`);
                setSelectedSeats([]);
                fetchAvailableSeats();
                
                setTimeout(() => {
                    setBookingSuccess("");
                }, 3000);
            }
        } catch (err) {
            console.error("Lỗi đặt vé:", err);
            alert(err.response?.data?.message || "Có lỗi xảy ra khi đặt vé!");
        }
    };

    // Hàm lấy ảnh phim dựa trên tên phim
    const getMovieImage = (title) => {
        const images = {
            "AVENGERS: ENDGAME": "https://image.tmdb.org/t/p/w500/ry8US8KWRxW3rZ7FHSQ8nxB6X8v.jpg",
            "JOKER": "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            "INSIDE OUT 2": "https://image.tmdb.org/t/p/w500/9FxJ2hLJKV8Tl9vSgvG1yO8Bm3d.jpg",
            "DUNE: PART TWO": "https://image.tmdb.org/t/p/w500/8uUUqvQnyD5M7J2Fh4bVQY9pV7.jpg",
            "OPPENHEIMER": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
            "BARBIE": "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg"
        };
        return images[title] || "https://placehold.co/300x450/e50914/white?text=DRAGONFIRE";
    };

    const renderSeatMap = () => {
        const rows = {};
        seats.forEach(seat => {
            const row = seat.seatNumber.charAt(0);
            if (!rows[row]) {
                rows[row] = [];
            }
            rows[row].push(seat);
        });

        Object.keys(rows).forEach(row => {
            rows[row].sort((a, b) => {
                const aNum = parseInt(a.seatNumber.substring(1));
                const bNum = parseInt(b.seatNumber.substring(1));
                return aNum - bNum;
            });
        });

        return (
            <div className="seat-map">
                <div className="screen">🎬 MÀN HÌNH 🎬</div>
                
                {Object.keys(rows).sort().map(row => (
                    <div key={row} className="seat-row">
                        <div className="row-label">{row}</div>
                        <div className="seat-grid">
                            {rows[row].map(seat => {
                                const isSelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);
                                let seatClass = "seat available";
                                if (seat.isBooked) {
                                    seatClass = "seat booked";
                                } else if (isSelected) {
                                    seatClass = "seat selected";
                                }
                                
                                return (
                                    <div
                                        key={seat.seatNumber}
                                        className={seatClass}
                                        onClick={() => handleSeatClick(seat)}
                                        title={`Ghế ${seat.seatNumber} - ${seat.isBooked ? "Đã đặt" : "Còn trống"}`}
                                    >
                                        {seat.seatNumber}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="loading showtime-loading">Đang tải sơ đồ ghế...</div>;
    }

    if (error) {
        return (
            <div className="showtime-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/showtimes")}>
                    Quay lại danh sách suất chiếu
                </button>
            </div>
        );
    }

    if (!showtime) {
        return (
            <div className="showtime-container">
                <div className="error-message">Không tìm thấy suất chiếu</div>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/showtimes")}>
                    Quay lại danh sách suất chiếu
                </button>
            </div>
        );
    }

    return (
        <div className="showtime-detail">
            {bookingSuccess && (
                <div className="success-message booking-success">
                    ✅ {bookingSuccess}
                </div>
            )}

            {/* Layout 2 cột: Ảnh bên trái, thông tin bên phải */}
            <div className="showtime-detail-layout">
                {/* Cột trái - Ảnh phim */}
                <div className="movie-poster-detail">
                    <img 
                        src={getMovieImage(showtime.movieTitle)}
                        alt={showtime.movieTitle}
                        className="movie-poster-img"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/300x450/e50914/white?text=DRAGONFIRE";
                        }}
                    />
                </div>

                {/* Cột phải - Thông tin và sơ đồ ghế */}
                <div className="showtime-detail-right">
                    <div className="showtime-detail-header">
                        <h2 className="showtime-detail-title">{showtime.movieTitle}</h2>
                        <button className="btn-back" onClick={() => navigate("/showtimes")}>
                            ← Quay lại
                        </button>
                    </div>

                    <div className="showtime-detail-info">
                        <div className="info-item">
                            <div className="info-label">📅 Ngày chiếu</div>
                            <div className="info-value">{formatDate(showtime.startTime)}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">⏰ Giờ chiếu</div>
                            <div className="info-value showtime-time-detail">{formatTime(showtime.startTime)}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">🏠 Rạp</div>
                            <div className="info-value">{showtime.cinemaName}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">🎭 Phòng</div>
                            <div className="info-value">{showtime.roomName}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">💰 Giá vé</div>
                            <div className="info-value showtime-price-detail">{showtime.price.toLocaleString()}đ</div>
                        </div>
                    </div>

                    {renderSeatMap()}

                    <div className="seat-legend">
                        <div className="legend-item">
                            <div className="legend-box available"></div>
                            <span>Ghế trống</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box selected"></div>
                            <span>Ghế đang chọn</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-box booked"></div>
                            <span>Ghế đã đặt</span>
                        </div>
                    </div>

                    {selectedSeats.length > 0 && (
                        <div className="booking-summary">
                            <div className="booking-info">
                                <div className="selected-seats">
                                    🎫 Ghế đã chọn: {selectedSeats.map(s => s.seatNumber).join(", ")}
                                </div>
                                <div className="total-price">
                                    Tổng tiền: {getTotalPrice().toLocaleString()}đ
                                </div>
                            </div>
                            <button className="btn btn-primary booking-btn" onClick={handleBooking}>
                                ĐẶT VÉ NGAY
                            </button>
                        </div>
                    )}

                    {!isLoggedIn && (
                        <div className="login-warning">
                            ⚠️ Vui lòng <button className="btn-link" onClick={() => navigate("/login")}>đăng nhập</button> để đặt vé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShowTimeDetails;