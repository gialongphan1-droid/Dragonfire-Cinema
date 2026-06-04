import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const token = localStorage.getItem("token");
  
  // Lấy thông tin user từ localStorage (đã lưu khi login)
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
        } else {
          alert(response.data.message);
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
      const response = await axios.delete(`${API_URL}/bookings/cancel-booking/${bookingId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
      if (response.data.success) {
        alert("Hủy đặt vé thành công!");
        // Cập nhật lại danh sách (xóa vé vừa hủy)
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
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
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
        return <span style={{ background: "#ffc107", color: "#000", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>Chờ thanh toán</span>;
      case "completed":
        return <span style={{ background: "#4caf50", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>Đã thanh toán</span>;
      case "cancelled":
        return <span style={{ background: "#555", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>Đã hủy</span>;
      default:
        return <span style={{ background: "#666", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="loading text-center mt-5">Đang tải lịch sử đặt vé...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="container" style={{ padding: "2rem 1rem", textAlign: "center" }}>
        <h2>📋 LỊCH SỬ ĐẶT VÉ</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "2rem" }}>Bạn chưa có đặt vé nào.</p>
        <button className="btn btn-primary" onClick={() => navigate("/showtimes")}>
          Đặt vé ngay
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "2rem 1rem" }}>
      <h1 className="section-title">📋 LỊCH SỬ ĐẶT VÉ</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {bookings.map((booking) => (
          <div
            key={booking._id}
            style={{
              background: "var(--surface-color)",
              borderRadius: "16px",
              padding: "20px",
              borderLeft: `5px solid ${
                booking.status === "completed" ? "#4caf50" : booking.status === "pending" ? "#ffc107" : "#555"
              }`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: "var(--primary-color)", marginBottom: "10px" }}>
                  🎬 {booking.showtimeId?.movieId?.title || "Không xác định"}
                </h3>
                <p style={{ margin: "5px 0" }}>
                  <strong>🏠 Rạp:</strong> {booking.showtimeId?.room || "Không xác định"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>📅 Ngày:</strong> {formatDate(booking.showtimeId?.date)} | <strong>⏰ Giờ:</strong> {booking.showtimeId?.time || "Không xác định"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>💺 Ghế:</strong> {booking.seats?.join(", ") || "Không có ghế"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>💰 Tổng tiền:</strong> {formatPrice(booking.totalAmount)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>🎫 Mã vé:</strong>{" "}
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "var(--accent-color)",
                    }}
                  >
                    {booking.ticketCode}
                  </span>
                </p>
              </div>
              <div style={{ textAlign: "right", minWidth: "120px" }}>
                {getStatusBadge(booking.status)}
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                  {new Date(booking.createdAt).toLocaleString("vi-VN")}
                </p>
                {/* 👇 CHỈ ADMIN MỚI THẤY NÚT HỦY */}
                {isAdmin && booking.status === "pending" && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    style={{
                      marginTop: "10px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      background: "#e50914",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {cancellingId === booking._id ? "Đang xử lý..." : "🗑️ Hủy vé"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;