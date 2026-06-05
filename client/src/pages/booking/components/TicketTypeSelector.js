import React, { useState, useEffect } from "react";

const TicketTypeSelector = ({ onChange, resetKey }) => {
  const [tickets, setTickets] = useState({ adult: 0, student: 0, senior: 0 });
  const prices = { adult: 69000, student: 49000, senior: 50000 };
  const labels = { adult: "Người lớn", student: "HSSV - U22", senior: "Người cao tuổi" };
  const icons = { adult: "👨", student: "🎓", senior: "👴" };

   useEffect(() => {
    setTickets({ adult: 0, student: 0, senior: 0 });
    onChange({ tickets: { adult: 0, student: 0, senior: 0 }, totalTicketPrice: 0, totalSeats: 0 });
  }, [resetKey]);

  const updateQuantity = (type, delta) => {
    const newQty = Math.max(0, tickets[type] + delta);
    const newTickets = { ...tickets, [type]: newQty };
    setTickets(newTickets);
    const totalTicketPrice =
      newTickets.adult * prices.adult +
      newTickets.student * prices.student +
      newTickets.senior * prices.senior;
    const totalSeats = newTickets.adult + newTickets.student + newTickets.senior;
    onChange({ tickets: newTickets, totalTicketPrice, totalSeats });
  };

  return (
    <div style={{ background: "var(--surface-color)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
      <h3 style={{ color: "var(--primary-color)", marginBottom: "20px", borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px" }}>
        🎫 CHỌN LOẠI VÉ
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {["adult", "student", "senior"].map((type) => (
          <div
            key={type}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              transition: "transform 0.2s",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>{icons[type]}</div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>{labels[type]}</div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--accent-color)", marginBottom: "5px" }}>
              {prices[type].toLocaleString()} VND
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "15px" }}>Đơn</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#333",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => updateQuantity(type, -1)}
                disabled={tickets[type] === 0}
              >
                -
              </button>
              <span style={{ fontSize: "18px", fontWeight: "bold", minWidth: "30px", textAlign: "center" }}>
                {tickets[type]}
              </span>
              <button
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#333",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => updateQuantity(type, 1)}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTypeSelector;
