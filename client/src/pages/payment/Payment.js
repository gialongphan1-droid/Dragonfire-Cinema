import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("booking");
  const amount = searchParams.get("amount");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  console.log("🔍 Payment page loaded - bookingId:", bookingId, "amount:", amount);

  const handlePayment = async (method) => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // TODO: Thay bằng API thanh toán thật của Đạt
      const response = await axios.post(`${API_URL}/payments/process`, {
        bookingId,
        amount: parseInt(amount),
        method
      }, config);
      
      if (response.data.success) {
        alert("Thanh toán thành công!");
        localStorage.removeItem("pendingBooking");
        navigate("/my-bookings");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="container" style={{ padding: "2rem 1rem", textAlign: "center" }}>
        <h2>❌ Thiếu thông tin đơn hàng</h2>
        <p>Vui lòng quay lại trang đặt vé và thử lại.</p>
        <button className="btn btn-primary" onClick={() => navigate("/showtimes")}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem", textAlign: "center" }}>
      <h1 style={{ color: "#e50914" }}>🧾 THANH TOÁN</h1>
      <div style={{ background: "#1e1e1e", padding: "2rem", borderRadius: "12px", marginTop: "2rem" }}>
        <p style={{ fontSize: "18px" }}>Số tiền cần thanh toán:</p>
        <p style={{ fontSize: "36px", fontWeight: "bold", color: "#ffc107" }}>
          {parseInt(amount).toLocaleString()} VND
        </p>
        <p style={{ marginTop: "1rem", color: "#b3b3b3" }}>Mã đơn hàng: {bookingId}</p>
      </div>
      
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "30px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={() => handlePayment("cash")} disabled={loading}>
          💵 Tiền mặt
        </button>
        <button className="btn btn-primary" onClick={() => handlePayment("banking")} disabled={loading}>
          🏦 Chuyển khoản
        </button>
        <button className="btn btn-primary" onClick={() => handlePayment("points")} disabled={loading}>
          ⭐ Thanh toán bằng điểm
        </button>
      </div>
      
      <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginTop: "30px" }}>
        ← Quay lại
      </button>
    </div>
  );
};

export default Payment;