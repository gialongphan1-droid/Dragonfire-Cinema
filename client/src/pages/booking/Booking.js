import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const showtimeId = searchParams.get("showtime");
  
  const [showtime, setShowtime] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const token = localStorage.getItem("token");

  // Tạo mảng ghế (A1-A10, B1-B10, ...)
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập để đặt vé!");
      navigate("/login");
      return;
    }
    
    if (!showtimeId) {
      alert("Không tìm thấy suất chiếu!");
      navigate("/showtimes");
      return;
    }
    
    fetchShowtime();
    fetchBookedSeats();
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      const response = await axios.get(`${API_URL}/showtimes`);
      if (response.data.success) {
        const found = response.data.data.find(st => st._id === showtimeId);
        setShowtime(found);
      }
    } catch (error) {
      console.error("Lỗi tải suất chiếu:", error);
    }
  };

  const fetchBookedSeats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/bookings/seats/${showtimeId}`, config);
      if (response.data.success) {
        setBookedSeats(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải ghế đã đặt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatName) => {
    // Không cho chọn ghế đã đặt
    if (bookedSeats.includes(seatName)) {
      alert("Ghế này đã được đặt!");
      return;
    }
    
    // Chọn/bỏ chọn ghế
    if (selectedSeats.includes(seatName)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatName));
    } else {
      if (selectedSeats.length >= 8) {
        alert("Mỗi lần chỉ được đặt tối đa 8 vé!");
        return;
      }
      setSelectedSeats([...selectedSeats, seatName]);
    }
  };

  const getSeatClass = (seatName) => {
    if (bookedSeats.includes(seatName)) return "seat booked";
    if (selectedSeats.includes(seatName)) return "seat selected";
    return "seat available";
  };

  const handleSubmit = async () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ghế!");
      return;
    }
    
    if (!window.confirm(`Xác nhận đặt ${selectedSeats.length} vé với tổng tiền ${formatCurrency(selectedSeats.length * showtime?.price)}?`)) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_URL}/bookings/create`,
        {
          showtimeId,
          seats: selectedSeats,
          paymentMethod: "cash"
        },
        config
      );
      
      if (response.data.success) {
        alert("Đặt vé thành công! Vui lòng thanh toán tại quầy.");
        navigate("/my-bookings");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (n) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải...</div>;
  }

  if (!showtime) {
    return <div className="text-center mt-5">Không tìm thấy suất chiếu!</div>;
  }

  return (
    <div className="booking-container">
      <div className="container">
        <h1 className="section-title">🎫 ĐẶT VÉ</h1>
        
        {/* Thông tin phim */}
        <div className="booking-info">
          <h2>{showtime.movieId?.title}</h2>
          <div className="booking-meta">
            <span>🏠 {showtime.room}</span>
            <span>📅 {formatDate(showtime.date)}</span>
            <span>⏰ {showtime.time}</span>
            <span>💰 {formatCurrency(showtime.price)}/vé</span>
          </div>
        </div>
        
        {/* Sơ đồ ghế */}
        <div className="seat-map">
          <div className="screen">MÀN HÌNH</div>
          
          {rows.map(row => (
            <div key={row} className="seat-row">
              <span className="row-label">{row}</span>
              {columns.map(col => {
                const seatName = `${row}${col}`;
                return (
                  <div
                    key={seatName}
                    className={getSeatClass(seatName)}
                    onClick={() => handleSeatClick(seatName)}
                  >
                    {col}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Chú thích */}
        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat available"></div>
            <span>Ghế trống</span>
          </div>
          <div className="legend-item">
            <div className="seat selected"></div>
            <span>Ghế đang chọn</span>
          </div>
          <div className="legend-item">
            <div className="seat booked"></div>
            <span>Ghế đã đặt</span>
          </div>
        </div>
        
        {/* Tổng kết */}
        <div className="booking-summary">
          <div className="summary-info">
            <span>Ghế đã chọn: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa có"}</span>
            <span>Tổng tiền: {formatCurrency(selectedSeats.length * showtime.price)}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedSeats.length === 0 || submitting}
          >
            {submitting ? "Đang xử lý..." : "XÁC NHẬN ĐẶT VÉ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;