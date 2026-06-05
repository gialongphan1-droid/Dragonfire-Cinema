import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ShowtimeAdmin = () => {
	const [showtimes, setShowtimes] = useState([]);
	const [movies, setMovies] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingShowtime, setEditingShowtime] = useState(null);
	const [formData, setFormData] = useState({
		movieId: "",
		roomId: "",
		roomName: "",
		date: "",
		time: "",
		price: "",
		rows: 8,
		columns: 12,
	});
	const [errors, setErrors] = useState({});
	const [serverTime, setServerTime] = useState(null);

	// State cho quản lý ghế
	const [showSeatModal, setShowSeatModal] = useState(false);
	const [currentShowtime, setCurrentShowtime] = useState(null);
	const [seats, setSeats] = useState([]);
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [actionLoading, setActionLoading] = useState(false);

	// ✅ SỬA: Dùng accessToken
	const token = localStorage.getItem("accessToken");
	const today = new Date().toISOString().split("T")[0];

	useEffect(() => {
		fetchServerTime();
		fetchRooms();
		fetchShowtimes();
		fetchMovies();
	}, []);

	const fetchServerTime = async () => {
		try {
			const response = await axios.get(`${API_URL}/current-time`);
			if (response.data.success) {
				setServerTime(new Date(response.data.currentTime));
			}
		} catch (err) {
			console.error("Lỗi lấy thời gian server:", err);
			setServerTime(new Date());
		}
	};

	const fetchRooms = async () => {
		try {
			// const token = localStorage.getItem("accessToken");
			const config = token
				? { headers: { Authorization: `Bearer ${token}` } }
				: {};
			const response = await axios.get(`${API_URL}/rooms`, config);
			if (response.data.success) {
				setRooms(response.data.data);
			}
		} catch (error) {
			console.error("Lỗi tải phòng:", error);
		}
	};

	const fetchShowtimes = async () => {
		try {
			const response = await axios.get(`${API_URL}/showtimes`);
			if (response.data.success) {
				setShowtimes(response.data.data);
			}
		} catch (error) {
			console.error("Lỗi tải suất chiếu:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchMovies = async () => {
		try {
			const response = await axios.get(`${API_URL}/movies`);
			if (response.data.success) {
				setMovies(response.data.data);
			}
		} catch (error) {
			console.error("Lỗi tải phim:", error);
		}
	};

	const fetchSeatsStatus = async (showtimeId) => {
		try {
			const response = await axios.get(
				`${API_URL}/showtimes/${showtimeId}/seats-status`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.data.success) {
				setSeats(response.data.data.seats);
			}
		} catch (error) {
			console.error("Lỗi tải ghế:", error);
			alert("Có lỗi xảy ra khi tải dữ liệu ghế!");
		}
	};

	// ... phần còn lại giữ nguyên

	const openSeatManager = async (showtime) => {
		setCurrentShowtime(showtime);
		setSelectedSeats([]);
		setShowSeatModal(true);
		await fetchSeatsStatus(showtime._id);
	};

	const handleSeatClick = (seat) => {
		if (seat.isBooked) {
			alert("Ghế đã được đặt, không thể thao tác!");
			return;
		}
		if (selectedSeats.includes(seat.seatNumber)) {
			setSelectedSeats(selectedSeats.filter((s) => s !== seat.seatNumber));
		} else {
			setSelectedSeats([...selectedSeats, seat.seatNumber]);
		}
	};

	const handleLockSeats = async () => {
		if (selectedSeats.length === 0) {
			alert("Vui lòng chọn ghế cần khóa!");
			return;
		}
		setActionLoading(true);
		try {
			const response = await axios.post(
				`${API_URL}/showtimes/lock-seats`,
				{
					showtimeId: currentShowtime._id,
					seats: selectedSeats,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.data.success) {
				alert(response.data.message);
				setSelectedSeats([]);
				await fetchSeatsStatus(currentShowtime._id);
				fetchShowtimes();
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setActionLoading(false);
		}
	};

	const handleUnlockSeats = async () => {
		if (selectedSeats.length === 0) {
			alert("Vui lòng chọn ghế cần mở khóa!");
			return;
		}
		setActionLoading(true);
		try {
			const response = await axios.post(
				`${API_URL}/showtimes/unlock-seats`,
				{
					showtimeId: currentShowtime._id,
					seats: selectedSeats,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.data.success) {
				alert(response.data.message);
				setSelectedSeats([]);
				await fetchSeatsStatus(currentShowtime._id);
				fetchShowtimes();
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setActionLoading(false);
		}
	};

	const getSeatClass = (seat) => {
		if (seat.isBooked) return "seat booked";
		if (seat.isLocked) return "seat locked";
		if (selectedSeats.includes(seat.seatNumber)) return "seat selected";
		return "seat available";
	};

	const isValidDateTime = (date, time) => {
		if (!date || !time) return false;
		const dateTimeString = `${date}T${time}:00`;
		const selectedDateTime = new Date(dateTimeString);
		const now = serverTime || new Date();
		return selectedDateTime > now;
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.movieId) newErrors.movieId = "Vui lòng chọn phim!";
		if (!formData.roomId) newErrors.roomId = "Vui lòng chọn phòng chiếu!";
		if (!formData.date) newErrors.date = "Vui lòng chọn ngày chiếu!";
		if (!formData.time) newErrors.time = "Vui lòng chọn giờ chiếu!";
		if (!formData.price || formData.price < 50000) {
			newErrors.price = "Giá vé phải từ 50,000đ trở lên!";
		}
		if (formData.rows < 2 || formData.rows > 8) {
			newErrors.rows = "Số hàng ghế phải từ 2 đến 8!";
		}
		if (formData.columns < 5 || formData.columns > 12) {
			newErrors.columns = "Số cột ghế phải từ 5 đến 12!";
		}
		if (
			formData.date &&
			formData.time &&
			!isValidDateTime(formData.date, formData.time)
		) {
			newErrors.time =
				"Thời gian chiếu không hợp lệ! Phải chọn thời gian trong tương lai.";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		// ✅ Lấy token mới mỗi lần gọi
		const token = localStorage.getItem("accessToken");

		if (!token) {
			alert("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
			return;
		}

		try {
			const config = { headers: { Authorization: `Bearer ${token}` } };
			const payload = {
				movieId: formData.movieId,
				cinemaName: "Dragonfire Cinema",
				roomId: formData.roomId,
				startTime: new Date(
					`${formData.date}T${formData.time}:00`,
				).toISOString(),
				price: parseInt(formData.price),
				rows: formData.rows,
				columns: formData.columns,
			};

			let response;
			if (editingShowtime) {
				response = await axios.put(
					`${API_URL}/showtimes/${editingShowtime._id}`,
					payload,
					config,
				);
			} else {
				response = await axios.post(`${API_URL}/showtimes`, payload, config);
			}

			if (response.data.success) {
				alert(response.data.message);
				setShowModal(false);
				setEditingShowtime(null);
				setFormData({
					movieId: "",
					roomId: "",
					roomName: "",
					date: "",
					time: "",
					price: "",
					rows: 8,
					columns: 12,
				});
				fetchShowtimes();
			}
		} catch (error) {
			console.error("❌ Submit error:", error);
			alert(error.response?.data?.message || "Có lỗi xảy ra");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Bạn có chắc muốn xóa suất chiếu này?")) return;

		// ✅ Lấy token mới
		const token = localStorage.getItem("accessToken");

		if (!token) {
			alert("Bạn chưa đăng nhập!");
			return;
		}

		try {
			const response = await axios.delete(`${API_URL}/showtimes/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				alert(response.data.message);
				fetchShowtimes();
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra");
		}
	};

	const handleEdit = (showtime) => {
		setEditingShowtime(showtime);
		setFormData({
			movieId: showtime.movieId?._id || "",
			roomId: showtime.roomId?._id || "",
			roomName: showtime.roomName || "",
			date: showtime.startTime
				? new Date(showtime.startTime).toISOString().split("T")[0]
				: "",
			time: showtime.startTime
				? new Date(showtime.startTime).toTimeString().slice(0, 5)
				: "",
			price: showtime.price || "",
			rows: showtime.rows || 8,
			columns: showtime.columns || 12,
		});
		setShowModal(true);
	};

	if (loading)
		return <div className="loading text-center mt-5">Đang tải...</div>;

	return (
		<div className="admin-showtime-container">
			<div className="admin-header">
				<h1>Quản Lý Suất Chiếu</h1>
				<button className="btn btn-primary" onClick={() => setShowModal(true)}>
					+ Thêm Suất Chiếu
				</button>
			</div>

			<div className="admin-table">
				<table className="admin-table">
					<thead>
						<tr>
							<th>STT</th>
							<th>Phim</th>
							<th>Phòng chiếu</th>
							<th>Ngày chiếu</th>
							<th>Giờ chiếu</th>
							<th>Ghế trống</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{showtimes.map((st, index) => {
							const totalSeats = st.seats?.length || st.availableSeats || 100;
							const bookedCount = st.bookedSeats?.length || 0;
							const lockedCount = st.lockedSeats?.length || 0;
							const available = totalSeats - bookedCount - lockedCount;
							return (
								<tr key={st._id}>
									<td>{index + 1}</td>
									<td>{st.movieId?.title || "Không xác định"}</td>
									<td>{st.roomName}</td>
									<td>
										{st.startTime
											? new Date(st.startTime).toLocaleDateString("vi-VN")
											: "Chưa có ngày"}
									</td>
									<td>
										{st.startTime
											? new Date(st.startTime).toLocaleTimeString("vi-VN", {
													hour: "2-digit",
													minute: "2-digit",
												})
											: "Chưa có giờ"}
									</td>
									<td className={available <= 10 ? "seats-low" : ""}>
										{available}/{totalSeats}
										{lockedCount > 0 && (
											<span className="locked-badge">
												{" "}
												({lockedCount} khóa)
											</span>
										)}
									</td>
									<td>
										<button
											className="btn btn-outline"
											onClick={() => handleEdit(st)}
										>
											Sửa
										</button>
										<button
											className="btn"
											style={{ background: "var(--error-color)" }}
											onClick={() => handleDelete(st._id)}
										>
											Xóa
										</button>
										<button
											className="btn btn-seat"
											style={{ background: "#ff9800" }}
											onClick={() => openSeatManager(st)}
										>
											🪑 Ghế
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Modal thêm/sửa suất chiếu */}
			{showModal && (
				<div className="modal-overlay" onClick={() => setShowModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<h2>
							{editingShowtime ? "Sửa Suất Chiếu" : "Thêm Suất Chiếu Mới"}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>Chọn phim *</label>
								<select
									className={`form-control ${errors.movieId ? "error" : ""}`}
									value={formData.movieId}
									onChange={(e) =>
										setFormData({ ...formData, movieId: e.target.value })
									}
								>
									<option value="">-- Chọn phim --</option>
									{movies.map((movie) => (
										<option key={movie._id} value={movie._id}>
											{movie.title}
										</option>
									))}
								</select>
								{errors.movieId && (
									<span className="error-text">{errors.movieId}</span>
								)}
							</div>

							<div className="form-group">
								<label>Phòng chiếu *</label>
								<select
									className={`form-control ${errors.roomId ? "error" : ""}`}
									value={formData.roomId}
									onChange={(e) => {
										const selectedRoom = rooms.find(
											(r) => r._id === e.target.value,
										);
										setFormData({
											...formData,
											roomId: selectedRoom?._id || "",
											roomName: selectedRoom?.name || "",
										});
									}}
								>
									<option value="">-- Chọn phòng --</option>
									{rooms.map((room) => (
										<option key={room._id} value={room._id}>
											{room.name} ({room.type})
										</option>
									))}
								</select>
								{errors.roomId && (
									<span className="error-text">{errors.roomId}</span>
								)}
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Số hàng ghế *</label>
									<input
										type="number"
										className={`form-control ${errors.rows ? "error" : ""}`}
										value={formData.rows}
										onChange={(e) =>
											setFormData({
												...formData,
												rows: parseInt(e.target.value) || 8,
											})
										}
										min="2"
										max="8"
									/>
								</div>
								<div className="form-group">
									<label>Số cột ghế *</label>
									<input
										type="number"
										className={`form-control ${errors.columns ? "error" : ""}`}
										value={formData.columns}
										onChange={(e) =>
											setFormData({
												...formData,
												columns: parseInt(e.target.value) || 12,
											})
										}
										min="5"
										max="12"
									/>
								</div>
							</div>

							<div className="form-group">
								<label>Ngày chiếu *</label>
								<input
									type="date"
									className={`form-control ${errors.date ? "error" : ""}`}
									value={formData.date}
									onChange={(e) =>
										setFormData({ ...formData, date: e.target.value })
									}
									min={today}
								/>
								{errors.date && (
									<span className="error-text">{errors.date}</span>
								)}
							</div>

							<div className="form-group">
								<label>Giờ chiếu *</label>
								<input
									type="time"
									className={`form-control ${errors.time ? "error" : ""}`}
									value={formData.time}
									onChange={(e) =>
										setFormData({ ...formData, time: e.target.value })
									}
									step="1800"
								/>
								{errors.time && (
									<span className="error-text">{errors.time}</span>
								)}
							</div>

							<div className="form-group">
								<label>Giá vé (VNĐ) *</label>
								<input
									type="number"
									className={`form-control ${errors.price ? "error" : ""}`}
									value={formData.price}
									onChange={(e) =>
										setFormData({ ...formData, price: e.target.value })
									}
									min="50000"
									step="10000"
								/>
								{errors.price && (
									<span className="error-text">{errors.price}</span>
								)}
							</div>

							<div className="modal-actions">
								<button
									type="button"
									className="btn btn-outline"
									onClick={() => setShowModal(false)}
								>
									Hủy
								</button>
								<button type="submit" className="btn btn-primary">
									{editingShowtime ? "Cập nhật" : "Thêm mới"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal quản lý ghế */}
			{showSeatModal && currentShowtime && (
				<div className="modal-overlay" onClick={() => setShowSeatModal(false)}>
					<div
						className="modal-content seat-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2>Quản lý ghế - {currentShowtime.movieId?.title}</h2>
						<div className="seat-manager-info">
							<p>
								📅 {new Date(currentShowtime.startTime).toLocaleString("vi-VN")}{" "}
								| 🏠 {currentShowtime.roomName}
							</p>
						</div>

						<div className="seat-legend">
							<div className="legend-item">
								<div className="seat available"></div>
								<span>Trống</span>
							</div>
							<div className="legend-item">
								<div className="seat selected"></div>
								<span>Đang chọn</span>
							</div>
							<div className="legend-item">
								<div className="seat booked"></div>
								<span>Đã đặt</span>
							</div>
							<div className="legend-item">
								<div className="seat locked"></div>
								<span>Đã khóa</span>
							</div>
						</div>

						<div className="seat-map-grid">
							{seats.map((seat, idx) => (
								<div
									key={idx}
									className={getSeatClass(seat)}
									onClick={() => handleSeatClick(seat)}
									title={
										seat.isBooked
											? "Đã đặt"
											: seat.isLocked
												? "Đã khóa"
												: "Click để chọn"
									}
								>
									{seat.seatNumber}
								</div>
							))}
						</div>

						<div className="action-buttons">
							<button
								className="btn-lock"
								onClick={handleLockSeats}
								disabled={actionLoading || selectedSeats.length === 0}
							>
								{actionLoading ? "Đang xử lý..." : "🔒 Khóa ghế đã chọn"}
							</button>
							<button
								className="btn-unlock"
								onClick={handleUnlockSeats}
								disabled={actionLoading || selectedSeats.length === 0}
							>
								{actionLoading ? "Đang xử lý..." : "🔓 Mở khóa ghế đã chọn"}
							</button>
							<button
								className="btn-close"
								onClick={() => setShowSeatModal(false)}
							>
								Đóng
							</button>
						</div>

						<div className="summary-info">
							<span>✅ Đã chọn: {selectedSeats.length} ghế</span>
							<span>
								🔒 Đã khóa: {seats.filter((s) => s.isLocked).length} ghế
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShowtimeAdmin;
