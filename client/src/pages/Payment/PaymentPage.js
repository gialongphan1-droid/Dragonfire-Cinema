import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

const API_URL = "http://localhost:5000/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { bookingId, movieTitle, showtime, seatNumber, totalAmount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  // Bấm THANH TOÁN -> Luôn thành công
  const handlePaymentSubmit = () => {
    setLoading(true);
    
    // Giả lập thời gian xử lý
    setTimeout(() => {
      setLoading(false);
      navigate("/payment/result", {
        state: {
          status: "success",
          message: "Đơn hàng đã được thanh toán thành công! Vé điện tử sẽ được gửi qua email.",
          bookingId: bookingId
        }
      });
    }, 1000);
  };

  // Bấm HỦY trong modal -> Chuyển sang trang thất bại
  const handleCancelTransaction = () => {
    setShowCancelModal(false);
    navigate("/payment/result", {
      state: {
        status: "failed",
        message: "Bạn đã hủy giao dịch thanh toán. Vui lòng thực hiện lại nếu có nhu cầu."
      }
    });
  };

  // Bấm QUAY LẠI -> Hiện modal xác nhận
  const handleGoBack = () => {
    setShowCancelModal(true);
  };

  if (!bookingId) return null;

  return (
    <>
      <div className="payment-page-container">
        <div className="payment-grid">
          
          {/* Cột trái: Thông tin vé */}
          <div className="payment-info-card">
            <h3 className="payment-section-title">🎬 THÔNG TIN VÉ PHIM</h3>
            <h4 className="movie-title">{movieTitle || "Không xác định"}</h4>
            <div className="payment-info-row">
              <span>📅 Suất chiếu:</span>
              <span>{showtime || "Không xác định"}</span>
            </div>
            <div className="payment-info-row">
              <span>💺 Số ghế:</span>
              <span>{seatNumber || "Không xác định"}</span>
            </div>
            <div className="total-amount">
              <span>TỔNG TIỀN:</span>
              <span className="total-price">{formatPrice(totalAmount || 0)}</span>
            </div>
          </div>

          {/* Cột phải: Phương thức thanh toán */}
          <div className="payment-methods-card">
            <h3 className="payment-section-title">💳 CHỌN PHƯƠNG THỨC THANH TOÁN</h3>
            
            <div className="payment-methods-list">
              {/* MoMo */}
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
                  <span className="payment-desc">Thanh toán qua thẻ ATM/Visa/Mastercard</span>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="payment-actions">
              <button 
                onClick={handleGoBack} 
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

      {/* Modal xác nhận hủy giao dịch */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelTransaction}
        title="Hủy giao dịch thanh toán"
        message="Bạn có chắc chắn muốn hủy giao dịch thanh toán với DRAGONFIRE CINEMA?"
      />
    </>
  );
};

export default PaymentPage;