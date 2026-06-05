import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TicketTypeSelector from "./components/TicketTypeSelector";
import SeatMap from "./components/SeatMap";
import BookingSummary from "./components/BookingSummary";
import VoucherInput from "./components/VoucherInput";

const API_URL = "http://localhost:5000/api";

const Booking = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const showtimeId = searchParams.get("showtime");

	const [showtime, setShowtime] = useState(null);
	const [occupiedSeats, setOccupiedSeats] = useState([]);
	const [lockedSeats, setLockedSeats] = useState([]);
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [ticketInfo, setTicketInfo] = useState({
		tickets: { adult: 0, student: 0, senior: 0 },
		totalTicketPrice: 0,
		totalSeats: 0,
	});
	const [selectedTicketPrice, setSelectedTicketPrice] = useState(0);
	const [totalPrice, setTotalPrice] = useState(0);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [voucherDiscount, setVoucherDiscount] = useState(0);
	const [finalPrice, setFinalPrice] = useState(0);
	const [appliedVoucher, setAppliedVoucher] = useState(null);
	
	const token = localStorage.getItem("token");

	useEffect(() => {
		if (!token) {
			alert("Vui lòng đăng nhập!");
			navigate("/login");
			return;
		}
		if (!showtimeId) {
			alert("Không tìm thấy suất chiếu!");
			navigate("/showtimes");
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			try {
				const showtimeRes = await axios.get(`${API_URL}/showtimes`);
				const found = showtimeRes.data.success
					? showtimeRes.data.data.find((st) => st._id === showtimeId)
					: null;
				if (!found) throw new Error("Không tìm thấy suất chiếu");
				setShowtime(found);

				const seatsRes = await axios.get(
					`${API_URL}/bookings/seats/${showtimeId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				if (seatsRes.data.success) {
					setOccupiedSeats(seatsRes.data.data.occupiedSeats || []);
					setLockedSeats(seatsRes.data.data.lockedSeats || []);
				}
			} catch (error) {
				console.error(error);
				alert("Lỗi tải dữ liệu!");
				navigate("/showtimes");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [showtimeId, token, navigate]);

	useEffect(() => {
		const total = selectedSeats.reduce((sum, seat) => {
			const seatPrice = seat.type === "vip" ? 120000 : selectedTicketPrice;
			return sum + seatPrice;
		}, 0);
		setTotalPrice(total);
	}, [selectedSeats, selectedTicketPrice]);

	useEffect(() => {
		const final = totalPrice - voucherDiscount;
		setFinalPrice(final > 0 ? final : 0);
	}, [totalPrice, voucherDiscount]);

	const handleTicketChange = (data) => {
		setTicketInfo(data);
		let price = 0;
		if (data.tickets.adult > 0) price = 69000;
		else if (data.tickets.student > 0) price = 49000;
		else if (data.tickets.senior > 0) price = 50000;
		setSelectedTicketPrice(price);
	};

	const handleSeatsChange = (seats) => {
		if (seats.length > ticketInfo.totalSeats) {
			alert(`Bạn chỉ có thể chọn ${ticketInfo.totalSeats} ghế!`);
			return;
		}
		setSelectedSeats(seats);
	};

	const handleVoucherApplied = (voucherData) => {
		if (voucherData) {
			setAppliedVoucher(voucherData);
			setVoucherDiscount(voucherData.discountAmount);
		} else {
			setAppliedVoucher(null);
			setVoucherDiscount(0);
		}
	};

	const handleConfirmBooking = async () => {
		if (ticketInfo.totalSeats === 0 && selectedSeats.length === 0) {
			alert("Vui lòng chọn vé hoặc ghế!");
			return;
		}
		if (
			ticketInfo.totalSeats > 0 &&
			selectedSeats.length !== ticketInfo.totalSeats
		) {
			alert(
				`Bạn đã chọn ${ticketInfo.totalSeats} vé nhưng chỉ chọn ${selectedSeats.length} ghế. Vui lòng chọn đủ số ghế!`,
			);
			return;
		}
		if (selectedSeats.length === 0) {
			alert("Vui lòng chọn ghế!");
			return;
		}

		setSubmitting(true);
		try {
			const config = { headers: { Authorization: `Bearer ${token}` } };
			const response = await axios.post(
				`${API_URL}/bookings/create`,
				{
					showtimeId,
					seats: selectedSeats.map((s) => s.id),
					totalAmount: finalPrice,
					voucherCode: appliedVoucher?.code || null,
				},
				config,
			);
			if (response.data.success) {
				alert(`Đặt vé thành công! Mã vé: ${response.data.data.ticketCode}`);
				navigate("/my-bookings");
			} else {
				alert(response.data.message);
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancel = () => {
		if (window.confirm("Hủy đặt vé?")) {
			setSelectedSeats([]);
			setTicketInfo({
				tickets: { adult: 0, student: 0, senior: 0 },
				totalTicketPrice: 0,
				totalSeats: 0,
			});
			setSelectedTicketPrice(0);
			setVoucherDiscount(0);
			setAppliedVoucher(null);
		}
	};

	// Kiểm tra xem đã chọn ghế và vé chưa
	const hasSelectedItems = (ticketInfo.totalSeats > 0 || selectedSeats.length > 0);

	if (loading)
		return (
			<div className="loading text-center mt-5">Đang tải thông tin...</div>
		);
	if (!showtime)
		return <div className="text-center mt-5">Không tìm thấy suất chiếu</div>;

	return (
		<div className="container" style={{ padding: "2rem 1rem" }}>
			<h1 className="section-title">ĐẶT VÉ</h1>
			<div
				style={{
					background: "#1e1e1e",
					padding: "1rem",
					borderRadius: "12px",
					marginBottom: "2rem",
				}}
			>
				<h2>{showtime.movieId?.title}</h2>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						flexWrap: "wrap",
						marginTop: "0.5rem",
					}}
				>
					<span>🏠 {showtime.room}</span>
					<span>📅 {new Date(showtime.date).toLocaleDateString("vi-VN")}</span>
					<span>⏰ {showtime.time}</span>
				</div>
			</div>

			<TicketTypeSelector onChange={handleTicketChange} />

			<SeatMap
				occupiedSeats={occupiedSeats}
				lockedSeats={lockedSeats}
				onSeatsChange={handleSeatsChange}
				maxSeats={ticketInfo.totalSeats || 0}
				selectedTicketPrice={selectedTicketPrice}
			/>

			{/* ✅ Chỉ hiển thị phần voucher khi đã chọn ghế hoặc vé */}
			{hasSelectedItems && (
				<VoucherInput 
					onVoucherApplied={handleVoucherApplied}
					totalAmount={totalPrice}
					token={token}
				/>
			)}

			<BookingSummary
				selectedSeats={selectedSeats}
				ticketInfo={ticketInfo}
				totalPrice={totalPrice}
				finalPrice={finalPrice}
				voucherDiscount={voucherDiscount}
				onConfirm={handleConfirmBooking}
				onCancel={handleCancel}
				loading={submitting}
			/>
		</div>
	);
};

export default Booking;