import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, message, bookingId } = location.state || {};

  useEffect(() => {
    // Tự động chuyển về trang booking sau 5 giây nếu thành công
    if (status === "success") {
      const timer = setTimeout(() => {
        navigate("/my-bookings");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const isSuccess = status === "success";

  return (
    <div className="payment-result-container">
      <div className={`payment-result-card ${isSuccess ? "success" : "failed"}`}>
        <div className="payment-result-icon">
          {isSuccess ? "✅" : "❌"}
        </div>
        <h2 className="payment-result-title">
          {isSuccess ? "THANH TOÁN THÀNH CÔNG!" : "GIAO DỊCH THẤT BẠI"}
        </h2>
        <p className="payment-result-message">{message}</p>
        
        {isSuccess && (
          <div className="payment-result-info">
            <p>Mã đơn hàng: <strong>{bookingId || "Đã được gửi qua email"}</strong></p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của Dragonfire Cinema!</p>
          </div>
        )}

        <div className="payment-result-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(isSuccess ? "/my-bookings" : "/booking")}
          >
            {isSuccess ? "XEM LỊCH SỬ ĐẶT VÉ" : "QUAY LẠI ĐẶT VÉ"}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate("/")}
          >
            VỀ TRANG CHỦ
          </button>
        </div>

        {!isSuccess && (
          <p className="payment-result-note">
            Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;