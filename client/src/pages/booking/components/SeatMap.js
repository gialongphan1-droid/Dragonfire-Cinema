import React, { useState, useEffect, useCallback } from "react";

const SeatMap = ({ occupiedSeats = [], onSeatsChange, maxSeats, selectedTicketPrice = 0 }) => {
  const [seats, setSeats] = useState([]);

  const generateSeats = useCallback(() => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const vipRows = ["F", "G", "H"];
    const allSeats = [];
    for (let row of rows) {
      for (let i = 1; i <= 12; i++) {
        const isVip = vipRows.includes(row);
        allSeats.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          type: isVip ? "vip" : "normal",
          price: isVip ? 120000 : selectedTicketPrice,
          isSelected: false,
          isOccupied: false,
        });
      }
    }
    return allSeats;
  }, [selectedTicketPrice]);

  useEffect(() => {
    const allSeats = generateSeats();
    setSeats(allSeats.map(seat => ({
      ...seat,
      isOccupied: occupiedSeats.includes(seat.id),
    })));
  }, [occupiedSeats, selectedTicketPrice, generateSeats]);

  const handleSeatClick = (clickedSeat) => {
    if (clickedSeat.isOccupied) return;
    
    const currentSelectedCount = seats.filter(s => s.isSelected).length;
    if (!clickedSeat.isSelected && currentSelectedCount >= maxSeats) {
      alert(`Chỉ được chọn ${maxSeats} ghế!`);
      return;
    }

    const updatedSeats = seats.map(seat =>
      seat.id === clickedSeat.id ? { ...seat, isSelected: !seat.isSelected } : seat
    );
    setSeats(updatedSeats);
    
    const newSelected = updatedSeats.filter(s => s.isSelected);
    onSeatsChange(newSelected);
  };

  // Màu sắc theo yêu cầu:
  // - Ghế thường (chưa chọn) = xanh lá #4caf50
  // - Ghế VIP = vàng #ffc107
  // - Ghế đang chọn = xám #9e9e9e
  // - Ghế đã đặt = xám đậm #555 + opacity
  const getSeatStyle = (seat) => {
    let backgroundColor = "#4caf50"; // xanh lá cho ghế thường
    let color = "#fff";
    
    if (seat.type === "vip") backgroundColor = "#ffc107"; // ghế VIP (vàng)
    if (seat.isSelected) backgroundColor = "#9e9e9e"; // ghế đang chọn (xám)
    if (seat.isOccupied) {
      backgroundColor = "#555"; // xám đậm cho đã đặt
      color = "#aaa";
    }
    
    return {
      width: "45px",
      height: "45px",
      borderRadius: "8px 8px 12px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13px",
      fontWeight: "bold",
      cursor: seat.isOccupied ? "not-allowed" : "pointer",
      backgroundColor,
      color,
      opacity: seat.isOccupied ? 0.6 : 1,
      transition: "all 0.2s",
    };
  };

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  
  if (seats.length === 0) return <div style={{ textAlign: "center", padding: "60px" }}>Đang tải sơ đồ ghế...</div>;

  return (
    <div style={{ background: "#1e1e1e", borderRadius: "16px", padding: "24px", margin: "20px 0" }}>
      <h3 style={{ color: "#e50914", marginBottom: "20px" }}>🎬 CHỌN GHẾ - RẠP 01</h3>
      
      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", background: "#4caf50", borderRadius: "6px" }}></div>
          <span>Ghế thường</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", background: "#ffc107", borderRadius: "6px" }}></div>
          <span>Ghế VIP (120k)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", background: "#9e9e9e", borderRadius: "6px" }}></div>
          <span>Ghế đang chọn</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "30px", height: "30px", background: "#555", borderRadius: "6px" }}></div>
          <span>Ghế đã đặt</span>
        </div>
      </div>
      
      {/* Screen */}
      <div style={{ background: "linear-gradient(180deg, #444, #1a1a1a)", width: "80%", height: "50px", margin: "0 auto 30px", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
        SCREEN
      </div>
      
      {/* Ghế */}
      <div style={{ overflowX: "auto" }}>
        {rows.map(row => (
          <div key={row} style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{ width: "40px", textAlign: "center", fontWeight: "bold", color: "#e50914", lineHeight: "45px" }}>{row}</div>
            {seats.filter(s => s.row === row).map(seat => (
              <div
                key={seat.id}
                style={getSeatStyle(seat)}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.number}
              </div>
            ))}
            <div style={{ width: "40px", textAlign: "center", fontWeight: "bold", color: "#e50914", lineHeight: "45px" }}>{row}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
