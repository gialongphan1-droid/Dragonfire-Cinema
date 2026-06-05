import React from "react";

const BookingSummary = ({
	selectedSeats,
	ticketInfo,
	totalPrice,
	onConfirm,
	onCancel,
	loading,
	voucherDiscount = 0,
	finalPrice = 0,
}) => {
	const formatPrice = (p) =>
		new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(p);

	const displayTotalPrice = finalPrice > 0 ? finalPrice : totalPrice;
	const displayVoucherDiscount = voucherDiscount > 0 ? voucherDiscount : 0;

	if (ticketInfo.totalSeats === 0 && selectedSeats.length === 0) {
		return (
			<div className="booking-summary-empty">
				Vui lòng chọn vé và ghế
			</div>
		);
	}

	return (
		<div className="booking-summary">
			<h3 className="booking-summary-title">
				📋 THÔNG TIN ĐẶT VÉ
			</h3>

			{ticketInfo.totalSeats > 0 && (
				<div className="booking-summary-section">
					<h4 className="booking-summary-subtitle">🎫 Vé:</h4>
					{ticketInfo.tickets.adult > 0 && (
						<div className="booking-summary-row">
							<span>Người lớn x{ticketInfo.tickets.adult}</span>
							<span>{formatPrice(69000 * ticketInfo.tickets.adult)}</span>
						</div>
					)}
					{ticketInfo.tickets.student > 0 && (
						<div className="booking-summary-row">
							<span>HSSV - U22 x{ticketInfo.tickets.student}</span>
							<span>{formatPrice(49000 * ticketInfo.tickets.student)}</span>
						</div>
					)}
					{ticketInfo.tickets.senior > 0 && (
						<div className="booking-summary-row">
							<span>Người cao tuổi x{ticketInfo.tickets.senior}</span>
							<span>{formatPrice(50000 * ticketInfo.tickets.senior)}</span>
						</div>
					)}
					<div className="booking-summary-total-row">
						<span>Tổng tiền vé:</span>
						<span>{formatPrice(ticketInfo.totalTicketPrice)}</span>
					</div>
				</div>
			)}

			{selectedSeats.length > 0 && (
				<div className="booking-summary-section">
					<h4 className="booking-summary-subtitle">💺 Ghế đã chọn:</h4>
					{selectedSeats.map((seat) => (
						<div key={seat.id} className="booking-summary-row">
							<span>
								{seat.id} ({seat.type === "vip" ? "VIP" : "Thường"})
							</span>
							<span>
								{formatPrice(seat.type === "vip" ? 120000 : seat.price)}
							</span>
						</div>
					))}
					<div className="booking-summary-total-row">
						<span>Tổng tiền ghế:</span>
						<span>
							{formatPrice(
								selectedSeats.reduce(
									(sum, s) => sum + (s.type === "vip" ? 120000 : s.price),
									0,
								),
							)}
						</span>
					</div>
				</div>
			)}

			{displayVoucherDiscount > 0 && (
				<div className="booking-summary-voucher">
					<div className="booking-summary-row discount">
						<span>🎫 Giảm giá (Voucher):</span>
						<span>- {formatPrice(displayVoucherDiscount)}</span>
					</div>
				</div>
			)}

			<div className="booking-summary-total">
				<span>TỔNG CỘNG:</span>
				<span className="booking-summary-total-price">
					{formatPrice(displayTotalPrice)}
				</span>
			</div>

			<div className="booking-summary-actions">
				<button
					className="booking-summary-btn-confirm"
					onClick={onConfirm}
					disabled={
						loading ||
						(ticketInfo.totalSeats === 0 && selectedSeats.length === 0)
					}
				>
					{loading ? "Đang xử lý..." : "🎟️ Xác nhận đặt vé"}
				</button>
				<button
					className="booking-summary-btn-cancel"
					onClick={onCancel}
					disabled={loading}
				>
					Hủy
				</button>
			</div>
			<p className="booking-summary-note">
				⏰ Giữ ghế trong 5 phút
			</p>
		</div>
	);
};

export default BookingSummary;