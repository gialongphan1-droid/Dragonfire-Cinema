import React, { useState, useEffect, useCallback } from "react";

const SeatMap = ({
	occupiedSeats = [],
	lockedSeats = [],
	onSeatsChange,
	maxSeats,
	selectedTicketPrice = 0,
}) => {
	const [seats, setSeats] = useState([]);

	// Nếu maxSeats = 0, không cho chọn ghế
	const canSelectSeats = maxSeats > 0;

	const generateSeats = useCallback(() => {
		const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
		const columns = 12;
		const vipRows = ["F", "G", "H"];
		const allSeats = [];

		for (let row of rows) {
			for (let i = 1; i <= columns; i++) {
				const isVip = vipRows.includes(row);
				allSeats.push({
					id: `${row}${i}`,
					row: row,
					number: i,
					type: isVip ? "vip" : "normal",
					price: isVip ? 120000 : selectedTicketPrice,
					isSelected: false,
					isOccupied: false,
					isLocked: false,
				});
			}
		}
		return allSeats;
	}, [selectedTicketPrice]);

	useEffect(() => {
		const allSeats = generateSeats();
		setSeats(
			allSeats.map((seat) => ({
				...seat,
				isOccupied: occupiedSeats.includes(seat.id),
				isLocked: lockedSeats?.includes(seat.id) || false,
			})),
		);
	}, [occupiedSeats, lockedSeats, selectedTicketPrice, generateSeats]);

	const handleSeatClick = (clickedSeat) => {
		// ✅ Nếu chưa chọn vé, thông báo và không cho chọn ghế
		if (!canSelectSeats) {
			alert("Vui lòng chọn số lượng vé trước!");
			return;
		}

		if (clickedSeat.isOccupied) {
			alert("Ghế này đã được đặt!");
			return;
		}
		if (clickedSeat.isLocked) {
			alert("Ghế này đã bị khóa bởi quản trị viên!");
			return;
		}
		const currentSelectedCount = seats.filter((s) => s.isSelected).length;
		if (!clickedSeat.isSelected && currentSelectedCount >= maxSeats) {
			alert(`Chỉ được chọn ${maxSeats} ghế!`);
			return;
		}
		const updatedSeats = seats.map((seat) =>
			seat.id === clickedSeat.id
				? { ...seat, isSelected: !seat.isSelected }
				: seat,
		);
		setSeats(updatedSeats);
		const newSelected = updatedSeats.filter((s) => s.isSelected);
		onSeatsChange(newSelected);
	};

	const getSeatClassName = (seat) => {
		let className = "seat";
		if (seat.type === "vip") className += " vip";
		if (seat.isSelected) className += " selected";
		if (seat.isOccupied) className += " booked";
		if (seat.isLocked) className += " locked";
		return className;
	};

	const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];

	if (seats.length === 0) {
		return (
			<div className="loading text-center mt-5">Đang tải sơ đồ ghế...</div>
		);
	}

	return (
		<div className="seat-map-container">
			<h3 className="seat-map-title">CHỌN GHẾ - RẠP 01</h3>

			<div className="seat-legend">
				<div className="legend-item">
					<div className="seat available"></div>
					<span>Ghế thường</span>
				</div>
				<div className="legend-item">
					<div className="seat vip"></div>
					<span>Ghế VIP (120k)</span>
				</div>
				<div className="legend-item">
					<div
						className="seat selected"
						style={{ backgroundColor: "#e50914" }}
					></div>
					<span>Ghế đang chọn</span>
				</div>
				<div className="legend-item">
					<div className="seat booked"></div>
					<span>Ghế đã đặt</span>
				</div>
				<div className="legend-item">
					<div className="seat locked"></div>
					<span>Ghế đã khóa</span>
				</div>
			</div>

			<div className="screen">MÀN HÌNH</div>

			<div className="seat-map-grid">
				{rows.map((row) => {
					const seatsInRow = seats.filter((s) => s.row === row);
					seatsInRow.sort((a, b) => a.number - b.number);
					return (
						<div key={row} className="seat-row">
							<div className="row-label">{row}</div>
							<div className="seats-in-row">
								{seatsInRow.map((seat) => (
									<div
										key={seat.id}
										className={getSeatClassName(seat)}
										onClick={() => handleSeatClick(seat)}
										title={
											!canSelectSeats
												? "Vui lòng chọn số lượng vé trước"
												: seat.isLocked
													? "Ghế đã bị khóa"
													: seat.isOccupied
														? "Ghế đã được đặt"
														: `Ghế ${seat.id}`
										}
									>
										{seat.number}
									</div>
								))}
							</div>
							<div className="row-label">{row}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default SeatMap;
