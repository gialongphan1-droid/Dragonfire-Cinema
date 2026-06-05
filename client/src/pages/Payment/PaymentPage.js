import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Nhận dữ liệu từ trang booking của Hiếu
  const {
    bookingId,
    movieTitle,
    cinemaName,
    cinemaAddress,
    date,
    time,
    room,
    seatNumber,
    ticketTypes,
    totalAmount
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }
    if (!bookingId) {
      alert("Không tìm thấy thông tin đơn hàng cần thanh toán!");
      navigate("/showtimes");
    }
  }, [bookingId, token, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND" 
    }).format(price);
  };

  // Hiển thị loại vé đã chọn
  const renderTicketTypes = () => {
    if (!ticketTypes) return null;
    const labels = { adult: "Người lớn", student: "HSSV - U22", senior: "Người cao tuổi" };
    const prices = { adult: 69000, student: 49000, senior: 50000 };
    
    return (
      <div className="ticket-types">
        {Object.entries(ticketTypes).map(([type, quantity]) => {
          if (quantity > 0) {
            return (
              <div key={type} className="ticket-type-item">
                <span>{labels[type]} x{quantity}</span>
                <span>{formatPrice(prices[type] * quantity)}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.post(
        `${API_URL}/payments/execute`,
        { bookingId, paymentMethod },
        config
      );

      if (response.data.success) {
        alert("Thanh toán thành công! Vé của bạn đã được xác nhận.");
        navigate("/my-bookings");
      } else {
        alert(response.data.message || "Thanh toán thất bại!");
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra trong quá trình xử lý thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) return null;

  return (
    <div className="payment-page-container">
      <div className="payment-grid">
        
        {/* Cột trái: Thông tin vé */}
        <div className="payment-info-card">
          <h3 className="payment-section-title">🎬 THÔNG TIN VÉ PHIM</h3>
          
          <h4 className="movie-title">{movieTitle}</h4>
          
          <div className="cinema-info">
            <p><strong>🏠 {cinemaName}</strong></p>
            <p className="cinema-address">{cinemaAddress}</p>
          </div>

          <div className="showtime-info">
            <p><strong>⏰ Thời gian:</strong> {time} - {date}</p>
            <p><strong>🎭 Phòng chiếu:</strong> {room}</p>
          </div>

          <div className="seat-info">
            <p><strong>💺 Số ghế:</strong> {seatNumber}</p>
          </div>

          <div className="ticket-info">
            <p><strong>🎫 Loại vé:</strong></p>
            {renderTicketTypes()}
          </div>

          <div className="total-amount">
            <span>TỔNG CỘNG:</span>
            <span className="total-price">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Cột phải: Phương thức thanh toán */}
        <div className="payment-methods-card">
          <h3 className="payment-section-title">💳 CHỌN PHƯƠNG THỨC THANH TOÁN</h3>
          
          <div className="payment-methods-list">
            {/* Momo */}
            <label className={`payment-method ${paymentMethod === "momo" ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">🔮</span>
              <div>
                <strong>Ví Điện Tử MoMo</strong>
                <span className="payment-desc">Thanh toán nhanh chóng qua ví MoMo</span>
              </div>
            </label>

            {/* VNPay */}
            <label className={`payment-method ${paymentMethod === "vnpay" ? "active" : ""}`}>
              <input
                type="radio"
                name="payment"
                value="vnpay"
                checked={paymentMethod === "vnpay"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-icon">💳</span>
              <div>
                <strong>VNPay</strong>
                <span className="payment-desc">Thanh toán qua thẻ ATM nội địa / Visa / Mastercard</span>
              </div>
            </label>
          </div>

          {/* Mã giảm giá (placeholder) */}
          <div className="discount-section">
            <input 
              type="text" 
              placeholder="Chọn hoặc nhập mã giảm giá" 
              className="discount-input"
              disabled
            />
            <span className="discount-note">Đăng nhập có mã giảm giá</span>
          </div>

          {/* Buttons */}
          <div className="payment-actions">
            <button 
              onClick={() => navigate("/showtimes")} 
              className="btn btn-outline"
              disabled={loading}
            >
              QUAY LẠI
            </button>
            <button 
              onClick={handlePaymentSubmit} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;