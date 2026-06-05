import React, { useState, useEffect, useCallback } from "react";
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
	const [bookingLocked, setBookingLocked] = useState(false);
	const [timer, setTimer] = useState(null);
	const [currentBookingId, setCurrentBookingId] = useState(null);
	const [timerInterval, setTimerInterval] = useState(null);
	const [resetCounter, setResetCounter] = useState(0);

	// State cho voucher
	const [voucherDiscount, setVoucherDiscount] = useState(0);
	const [finalPrice, setFinalPrice] = useState(0);
	const [appliedVoucher, setAppliedVoucher] = useState(null);

	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const isAdmin = user.role === "admin";
	const token = localStorage.getItem("accessToken");

	const formatTimer = useCallback((totalSeconds) => {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}, []);

	const stopTimer = useCallback(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
			setTimerInterval(null);
		}
	}, [timerInterval]);

	const handleAutoCancel = useCallback(
		async (bookingId) => {
			if (isAdmin) return;
			try {
				const config = { headers: { Authorization: `Bearer ${token}` } };
				await axios.delete(`${API_URL}/bookings/cancel/${bookingId}`, config);
				localStorage.removeItem("pendingBooking");
				setBookingLocked(false);
				setCurrentBookingId(null);
				setTimer(null);
				alert("Hết thời gian giữ ghế! Ghế đã được giải phóng.");
				window.location.reload();
			} catch (error) {
				console.error("Auto cancel error:", error);
			}
		},
		[isAdmin, token],
	);

	const startTimer = useCallback(
		(expiresAt, bookingId) => {
			if (isAdmin) return;
			console.log("⏰ BẮT ĐẦU TIMER, expiresAt:", expiresAt);
			stopTimer();
			const expireDate = new Date(expiresAt);
			const interval = setInterval(() => {
				const now = new Date();
				const diff = expireDate - now;
				if (diff <= 0) {
					clearInterval(interval);
					setTimer("0:00");
					handleAutoCancel(bookingId);
				} else {
					const totalSeconds = Math.floor(diff / 1000);
					setTimer(formatTimer(totalSeconds));
				}
			}, 1000);
			setTimerInterval(interval);
		},
		[isAdmin, stopTimer, handleAutoCancel, formatTimer],
	);

	// Khôi phục trạng thái từ localStorage
	useEffect(() => {
		if (isAdmin) return;
		const savedBooking = localStorage.getItem("pendingBooking");
		if (savedBooking) {
			const { bookingId, expiresAt, savedShowtimeId } =
				JSON.parse(savedBooking);
			if (savedShowtimeId === showtimeId) {
				setCurrentBookingId(bookingId);
				setBookingLocked(true);
				startTimer(expiresAt, bookingId);
			} else {
				localStorage.removeItem("pendingBooking");
			}
		}
	}, [showtimeId, isAdmin, startTimer]);

	// Polling cập nhật ghế realtime
	useEffect(() => {
		if (!showtimeId || !token) return;
		const fetchOccupiedSeats = async () => {
			try {
				const res = await axios.get(`${API_URL}/bookings/seats/${showtimeId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.data.success) {
					console.log(
						"🔄 Cập nhật occupiedSeats từ polling:",
						res.data.data.occupiedSeats,
					);
					setOccupiedSeats(res.data.data.occupiedSeats || []);
				}
			} catch (error) {
				console.error(error);
			}
		};
		fetchOccupiedSeats();
		const interval = setInterval(fetchOccupiedSeats, 5000);
		return () => clearInterval(interval);
	}, [showtimeId, token]);

	// Fetch dữ liệu ban đầu
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
					console.log(
						"🎯 occupiedSeats từ API ban đầu:",
						seatsRes.data.data.occupiedSeats,
					);
					setOccupiedSeats(seatsRes.data.data.occupiedSeats || []);
				}
			} catch (error) {
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

	// Cập nhật giá sau voucher
	useEffect(() => {
		const final = totalPrice - voucherDiscount;
		setFinalPrice(final > 0 ? final : 0);
	}, [totalPrice, voucherDiscount]);

	const handleTicketChange = (data) => {
		if (!isAdmin && bookingLocked) {
			alert(
				"Bạn đang có vé chờ thanh toán, vui lòng hoàn tất hoặc hủy trước khi đặt vé mới!",
			);
			return;
		}
		setTicketInfo(data);
		let price = 0;
		if (data.tickets.adult > 0) price = 69000;
		else if (data.tickets.student > 0) price = 49000;
		else if (data.tickets.senior > 0) price = 50000;
		setSelectedTicketPrice(price);
	};

	const handleSeatsChange = (seats) => {
		console.log("📦 Booking nhận ghế từ SeatMap:", seats);
		if (!isAdmin && bookingLocked) {
			alert(
				"Bạn đang có vé chờ thanh toán, vui lòng hoàn tất hoặc hủy trước khi đặt vé mới!",
			);
			return;
		}
		if (seats.length > ticketInfo.totalSeats && ticketInfo.totalSeats > 0) {
			alert(`Bạn chỉ có thể chọn ${ticketInfo.totalSeats} ghế!`);
			return;
		}
		setSelectedSeats(seats);
	};

	const handleVoucherApplied = (voucherData) => {
		if (voucherData) {
			setAppliedVoucher(voucherData);
			setVoucherDiscount(voucherData.discountAmount);
			setFinalPrice(voucherData.finalAmount);
		} else {
			setAppliedVoucher(null);
			setVoucherDiscount(0);
			setFinalPrice(totalPrice);
		}
	};

	const clearPendingBooking = async () => {
		if (isAdmin) return;
		if (currentBookingId) {
			try {
				const config = { headers: { Authorization: `Bearer ${token}` } };
				await axios.delete(
					`${API_URL}/bookings/cancel/${currentBookingId}`,
					config,
				);
			} catch (error) {
				console.error("Clear pending error:", error);
			}
		}
		stopTimer();
		localStorage.removeItem("pendingBooking");
		setBookingLocked(false);
		setCurrentBookingId(null);
		setTimer(null);
	};

	const handleConfirmBooking = async () => {
		if (!isAdmin && bookingLocked) {
			alert(
				"Bạn đang có vé chờ thanh toán, vui lòng hoàn tất hoặc hủy trước khi đặt vé mới!",
			);
			return;
		}
		if (ticketInfo.totalSeats === 0 && selectedSeats.length === 0) {
			alert("Vui lòng chọn vé hoặc ghế!");
			return;
		}
		if (
			ticketInfo.totalSeats > 0 &&
			selectedSeats.length !== ticketInfo.totalSeats
		) {
			alert(
				`Bạn đã chọn ${ticketInfo.totalSeats} vé nhưng chỉ chọn ${selectedSeats.length} ghế!`,
			);
			return;
		}
		if (selectedSeats.length === 0) {
			alert("Vui lòng chọn ghế!");
			return;
		}

		setSubmitting(true);
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			};

			const response = await axios.post(
				`${API_URL}/bookings/create`,
				{
					showtimeId,
					seats: selectedSeats.map((s) => s.id),
					totalAmount: finalPrice || totalPrice,
					voucherCode: appliedVoucher?.code || null,
					discountAmount: voucherDiscount || 0,
				},
				config,
			);

			console.log("📝 Response đặt vé:", response.data);

			if (response.data.success) {
				const { bookingId, expiresAt, ticketCode, finalAmount, pointsEarned } =
					response.data.data;

				if (!isAdmin) {
					setCurrentBookingId(bookingId);
					setBookingLocked(true);
					startTimer(expiresAt, bookingId);
					localStorage.setItem(
						"pendingBooking",
						JSON.stringify({
							bookingId,
							expiresAt,
							savedShowtimeId: showtimeId,
						}),
					);
				}

				let successMsg = `Đặt vé thành công! Mã vé: ${ticketCode}\n`;
				successMsg += `💰 Tổng tiền: ${(finalAmount || finalPrice || totalPrice).toLocaleString()}đ\n`;
				successMsg += `⭐ Nhận được ${pointsEarned} điểm thưởng`;
				if (appliedVoucher) {
					successMsg += `\n🎫 Đã áp dụng voucher: ${appliedVoucher.code} (giảm ${voucherDiscount.toLocaleString()}đ)`;
				}

				alert(successMsg);

				if (!isAdmin) {
					navigate(
						`/payment?booking=${bookingId}&amount=${finalAmount || finalPrice || totalPrice}`,
					);
				} else {
					navigate("/my-bookings");
				}
			} else {
				alert(response.data.message);
			}
		} catch (error) {
			console.error("❌ Lỗi đặt vé:", error);
			alert(error.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCancelLockedBooking = async () => {
		if (isAdmin) return;
		if (!currentBookingId) return;
		if (!window.confirm("Bạn có chắc muốn hủy đặt vé này?")) return;
		await clearPendingBooking();
		alert("Hủy đặt vé thành công!");
		window.location.reload();
	};

	const handleCancel = () => {
		setSelectedSeats([]);
		setTicketInfo({
			tickets: { adult: 0, student: 0, senior: 0 },
			totalTicketPrice: 0,
			totalSeats: 0,
		});
		setSelectedTicketPrice(0);
		setVoucherDiscount(0);
		setAppliedVoucher(null);
		setResetCounter((prev) => prev + 1);
		console.log("🗑️ Đã hủy toàn bộ lựa chọn");
	};

	if (loading)
		return (
			<div className="loading text-center mt-5">Đang tải thông tin...</div>
		);
	if (!showtime)
		return <div className="text-center mt-5">Không tìm thấy suất chiếu</div>;

	const roomDisplayName = showtime?.roomName || showtime?.room || "RẠP 01";
	const roomType = showtime?.roomId?.type || "";
	const cinemaName = showtime?.cinemaName || "Dragonfire Cinema";

	// Xác định loại vé đang chọn
	let currentTicketType = "student";
	if (ticketInfo.tickets.adult > 0) currentTicketType = "adult";
	else if (ticketInfo.tickets.student > 0) currentTicketType = "student";
	else if (ticketInfo.tickets.senior > 0) currentTicketType = "senior";

	return (
		<div className="container" style={{ padding: "2rem 1rem" }}>
			<h1 className="section-title">🎫 ĐẶT VÉ</h1>
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
					<span>🏠 {cinemaName}</span>
					<span>
						🎭 {roomDisplayName}
						{roomType && ` (${roomType})`}
					</span>
					<span>
						📅{" "}
						{new Date(showtime.startTime || showtime.date).toLocaleDateString(
							"vi-VN",
						)}
					</span>
					<span>
						⏰{" "}
						{new Date(showtime.startTime || showtime.date).toLocaleTimeString(
							"vi-VN",
							{ hour: "2-digit", minute: "2-digit" },
						)}
					</span>
					{isAdmin && <span style={{ color: "#ffc107" }}>👑 Chế độ Admin</span>}
				</div>

				{!isAdmin && bookingLocked && timer && timer !== "0:00" && (
					<div
						style={{
							background: "rgba(255,193,7,0.2)",
							padding: "12px",
							borderRadius: "8px",
							marginTop: "15px",
							textAlign: "center",
							border: "1px solid #ffc107",
						}}
					>
						⏳{" "}
						<span
							style={{ color: "#ffc107", fontSize: "28px", fontWeight: "bold" }}
						>
							{timer}
						</span>
						<span style={{ marginLeft: "10px" }}>còn lại để thanh toán</span>
						<button
							onClick={handleCancelLockedBooking}
							style={{
								marginLeft: "20px",
								padding: "5px 15px",
								background: "#e50914",
								color: "#fff",
								border: "none",
								borderRadius: "5px",
								cursor: "pointer",
							}}
						>
							Hủy đặt vé
						</button>
					</div>
				)}
			</div>

			<TicketTypeSelector
				onChange={handleTicketChange}
				resetKey={resetCounter}
			/>

			<SeatMap
				key={resetCounter}
				occupiedSeats={occupiedSeats}
				onSeatsChange={handleSeatsChange}
				maxSeats={ticketInfo.totalSeats || 0}
				selectedTicketPrice={selectedTicketPrice}
				disabled={!isAdmin && bookingLocked}
				roomName={roomDisplayName}
				roomType={roomType}
			/>

			{/* Voucher Input - Chỉ hiển thị khi có ghế hoặc vé */}
			{(selectedSeats.length > 0 || ticketInfo.totalSeats > 0) && (
				<VoucherInput
					onVoucherApplied={handleVoucherApplied}
					totalAmount={totalPrice}
					token={token}
					ticketTypes={[currentTicketType]}
					seatTypes={selectedSeats.map((s) =>
						s.type === "vip" ? "vip" : "normal",
					)}
					ticketItems={[
						{
							type: currentTicketType,
							price: selectedTicketPrice,
							quantity: ticketInfo.totalSeats || selectedSeats.length,
						},
					]}
					seatItems={selectedSeats.map((s) => ({
						type: s.type === "vip" ? "vip" : "normal",
						price: s.type === "vip" ? 120000 : selectedTicketPrice,
						seatName: s.id,
					}))}
				/>
			)}

			<BookingSummary
				selectedSeats={selectedSeats}
				ticketInfo={ticketInfo}
				totalPrice={totalPrice}
				finalPrice={finalPrice}
				voucherDiscount={voucherDiscount}
				appliedVoucher={appliedVoucher}
				onConfirm={handleConfirmBooking}
				onCancel={handleCancel}
				loading={submitting}
				disabled={!isAdmin && bookingLocked}
			/>
		</div>
	);
};

export default Booking;
