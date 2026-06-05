import React from "react";


const BookingSummary = ({ selectedSeats, ticketInfo, totalPrice, onConfirm, onCancel, loading, disabled = false }) => {
  const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

  console.log("📊 BookingSummary - totalPrice:", totalPrice, "selectedSeats:", selectedSeats);

  if (ticketInfo.totalSeats === 0 && selectedSeats.length === 0) {
    return (
      <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "24px", textAlign: "center", color: "#b3b3b3" }}>
        Vui lòng chọn vé và ghế
      </div>
    );
  }

  return (
    <div style={{ background: "#1e1e1e", borderRadius: "12px", padding: "24px", position: "sticky", top: "20px" }}>
      <h3 style={{ color: "#e50914", borderBottom: "2px solid #e50914", paddingBottom: "10px", marginBottom: "20px" }}>
        📋 THÔNG TIN ĐẶT VÉ
      </h3>

      {ticketInfo.totalSeats > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#ffc107", marginBottom: "10px" }}>🎫 Vé:</h4>
          {ticketInfo.tickets.adult > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Người lớn x{ticketInfo.tickets.adult}</span>
              <span>{formatPrice(69000 * ticketInfo.tickets.adult)}</span>
            </div>
          )}
          {ticketInfo.tickets.student > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>HSSV - U22 x{ticketInfo.tickets.student}</span>
              <span>{formatPrice(49000 * ticketInfo.tickets.student)}</span>
            </div>
          )}
          {ticketInfo.tickets.senior > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>Người cao tuổi x{ticketInfo.tickets.senior}</span>
              <span>{formatPrice(50000 * ticketInfo.tickets.senior)}</span>
            </div>
          )}
          <div style={{ borderTop: "1px solid #333", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>Tổng tiền vé:</span>
            <span>{formatPrice(ticketInfo.totalTicketPrice)}</span>
          </div>
        </div>
      )}

      {selectedSeats.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ color: "#ffc107", marginBottom: "10px" }}>💺 Ghế đã chọn:</h4>
          {selectedSeats.map(seat => (
            <div key={seat.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span>{seat.id} ({seat.type === "vip" ? "VIP" : "Thường"})</span>
              <span>{formatPrice(seat.type === "vip" ? 120000 : seat.price)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #333", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
            <span>Tổng tiền ghế:</span>
            <span>{formatPrice(selectedSeats.reduce((sum, s) => sum + (s.type === "vip" ? 120000 : s.price), 0))}</span>
          </div>
        </div>
      )}

      <div style={{ padding: "15px", background: "rgba(229,9,20,0.1)", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
        <span>TỔNG CỘNG:</span>
        <span style={{ fontSize: "22px", color: "#ffc107" }}>{formatPrice(totalPrice)}</span>
      </div>

      <div style={{ display: "flex", gap: "12px" }}>
        <button 
          onClick={onConfirm} 
          disabled={loading || disabled || (ticketInfo.totalSeats === 0 && selectedSeats.length === 0)} 
          style={{ flex: 2, background: "#e50914", padding: "12px", fontSize: "16px", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer" }}
        >
          {loading ? "Đang xử lý..." : "🎟️ Xác nhận đặt vé"}
        </button>
        <button 
          onClick={onCancel} 
          disabled={loading} 
          style={{ flex: 1, background: "#333", padding: "12px", fontSize: "16px", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer" }}
        >
          Hủy
        </button>
      </div>
      <p style={{ fontSize: "12px", color: "#b3b3b3", marginTop: "15px", textAlign: "center" }}>
        ⏰ Giữ ghế trong 5 phút
      </p>
    </div>
  );
};

export default BookingSummary;