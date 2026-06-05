import React, { useState, useEffect, useCallback } from "react";

const SeatMap = ({ occupiedSeats = [], onSeatsChange, maxSeats, selectedTicketPrice = 0, disabled = false, roomName = "RẠP 01", roomType = "" }) => {
  const [seats, setSeats] = useState([]);
  const [, setSelectedSeats] = useState([]);

  const getSeatPrice = useCallback((isVip) => {
    if (isVip) return 120000;
    if (selectedTicketPrice > 0) return selectedTicketPrice;
    return 69000;
  }, [selectedTicketPrice]);

  const generateSeats = useCallback(() => {
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const vipRows = ["F", "G", "H"];
    return rows.flatMap(row =>
      Array.from({ length: 12 }, (_, i) => {
        const isVip = vipRows.includes(row);
        return {
          id: `${row}${i + 1}`,
          row,
          number: i + 1,
          type: isVip ? "vip" : "normal",
          price: getSeatPrice(isVip),
          isSelected: false,
          isOccupied: false,
        };
      })
    );
  }, [getSeatPrice]);

  useEffect(() => {
    setSeats(prevSeats =>
      prevSeats.map(seat => ({
        ...seat,
        price: seat.type === "vip" ? 120000 : getSeatPrice(false),
      }))
    );
  }, [selectedTicketPrice, getSeatPrice]);

  useEffect(() => {
    console.log("🎯 SeatMap nhận occupiedSeats:", occupiedSeats);
    setSeats(prevSeats => {
      const allSeats = generateSeats();
      return allSeats.map(seat => ({
        ...seat,
        isOccupied: occupiedSeats.includes(seat.id),
        isSelected: prevSeats.find(s => s.id === seat.id)?.isSelected || false,
      }));
    });
  }, [occupiedSeats, generateSeats]);

  const handleSeatClick = (seat) => {
    if (disabled) {
      alert("Bạn đang có vé chờ thanh toán, vui lòng hoàn tất hoặc hủy trước khi chọn ghế mới!");
      return;
    }
    if (seat.isOccupied) {
      alert("Ghế này đã được đặt!");
      return;
    }
    
    const currentSelectedCount = seats.filter(s => s.isSelected).length;
    // Nếu đã chọn vé (maxSeats > 0) thì giới hạn số ghế bằng số vé
    if (maxSeats > 0 && !seat.isSelected && currentSelectedCount >= maxSeats) {
      alert(`Bạn chỉ được chọn tối đa ${maxSeats} ghế (tương ứng với số vé đã chọn)!`);
      return;
    }
    
    const updated = seats.map(s =>
      s.id === seat.id ? { ...s, isSelected: !s.isSelected } : s
    );
    setSeats(updated);
    const newSelected = updated.filter(s => s.isSelected);
    setSelectedSeats(newSelected);
    onSeatsChange(newSelected);
  };

  const getSeatStyle = (seat) => {
    let backgroundColor = "#4caf50";
    let color = "#fff";
    
    if (seat.type === "vip") backgroundColor = "#ffc107";
    if (seat.isSelected) backgroundColor = "#9e9e9e";
    if (seat.isOccupied) {
      backgroundColor = "#555";
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
  if (seats.length === 0) return <div className="loading-text">Đang tải sơ đồ ghế...</div>;

  const titleDisplay = `🎬 CHỌN GHẾ - ${roomName}${roomType ? ` (${roomType})` : ""}`;

  return (
    <div style={{ background: "#1e1e1e", borderRadius: "16px", padding: "24px", margin: "20px 0" }}>
      <h3 style={{ color: "#e50914", marginBottom: "20px" }}>{titleDisplay}</h3>
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div><span style={{ display: "inline-block", width: "30px", height: "30px", background: "#4caf50", borderRadius: "6px", marginRight: "8px" }}></span>Ghế thường</div>
        <div><span style={{ display: "inline-block", width: "30px", height: "30px", background: "#ffc107", borderRadius: "6px", marginRight: "8px" }}></span>Ghế VIP (120k)</div>
        <div><span style={{ display: "inline-block", width: "30px", height: "30px", background: "#9e9e9e", borderRadius: "6px", marginRight: "8px" }}></span>Ghế đang chọn</div>
        <div><span style={{ display: "inline-block", width: "30px", height: "30px", background: "#555", borderRadius: "6px", marginRight: "8px" }}></span>Ghế đã đặt / đang giữ</div>
      </div>
      <div style={{ background: "linear-gradient(180deg, #444, #1a1a1a)", width: "80%", height: "50px", margin: "0 auto 30px", borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
        SCREEN
      </div>
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
