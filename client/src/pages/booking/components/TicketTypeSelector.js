import React, { useState } from "react";

const TicketTypeSelector = ({ onChange }) => {
	const [tickets, setTickets] = useState({
		adult: 0,
		student: 0,
		senior: 0,
	});

	const ticketPrices = {
		adult: 69000,
		student: 49000,
		senior: 50000,
	};

	const handleIncrease = (type) => {
		const newValue = tickets[type] + 1;
		const totalSeats = tickets.adult + tickets.student + tickets.senior;
		if (totalSeats + 1 > 8) {
			alert("Mỗi lần chỉ được đặt tối đa 8 vé!");
			return;
		}
		const newTickets = { ...tickets, [type]: newValue };
		setTickets(newTickets);
		
		const totalTicketPrice = 
			newTickets.adult * ticketPrices.adult +
			newTickets.student * ticketPrices.student +
			newTickets.senior * ticketPrices.senior;
		
		onChange({
			tickets: newTickets,
			totalTicketPrice,
			totalSeats: newTickets.adult + newTickets.student + newTickets.senior,
		});
	};

	const handleDecrease = (type) => {
		if (tickets[type] === 0) return;
		const newValue = tickets[type] - 1;
		const newTickets = { ...tickets, [type]: newValue };
		setTickets(newTickets);
		
		const totalTicketPrice = 
			newTickets.adult * ticketPrices.adult +
			newTickets.student * ticketPrices.student +
			newTickets.senior * ticketPrices.senior;
		
		onChange({
			tickets: newTickets,
			totalTicketPrice,
			totalSeats: newTickets.adult + newTickets.student + newTickets.senior,
		});
	};

	return (
		<div className="ticket-selector">
			<h3 className="ticket-selector-title">CHỌN LOẠI VÉ</h3>
			<div className="ticket-list">
				{/* Vé người lớn */}
				<div className="ticket-item">
					<div className="ticket-info">
						<span className="ticket-name">Người lớn</span>
						<span className="ticket-price">{ticketPrices.adult.toLocaleString()} VND</span>
					</div>
					<div className="ticket-quantity">
						<button className="quantity-btn" onClick={() => handleDecrease("adult")}>-</button>
						<span className="quantity-value">{tickets.adult}</span>
						<button className="quantity-btn" onClick={() => handleIncrease("adult")}>+</button>
					</div>
				</div>

				{/* Vé HSSV - U22 */}
				<div className="ticket-item">
					<div className="ticket-info">
						<span className="ticket-name">HSSV - U22</span>
						<span className="ticket-price">{ticketPrices.student.toLocaleString()} VND</span>
					</div>
					<div className="ticket-quantity">
						<button className="quantity-btn" onClick={() => handleDecrease("student")}>-</button>
						<span className="quantity-value">{tickets.student}</span>
						<button className="quantity-btn" onClick={() => handleIncrease("student")}>+</button>
					</div>
				</div>

				{/* Vé người cao tuổi */}
				<div className="ticket-item">
					<div className="ticket-info">
						<span className="ticket-name">Người cao tuổi</span>
						<span className="ticket-price">{ticketPrices.senior.toLocaleString()} VND</span>
					</div>
					<div className="ticket-quantity">
						<button className="quantity-btn" onClick={() => handleDecrease("senior")}>-</button>
						<span className="quantity-value">{tickets.senior}</span>
						<button className="quantity-btn" onClick={() => handleIncrease("senior")}>+</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketTypeSelector;