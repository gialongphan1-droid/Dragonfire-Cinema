import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const ShowtimeList = () => {
	const navigate = useNavigate();
	const [showtimes, setShowtimes] = useState([]);
	const [movies, setMovies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedMovie, setSelectedMovie] = useState("");
	const [selectedDate, setSelectedDate] = useState("");
	const [filteredShowtimes, setFilteredShowtimes] = useState([]);
	const [serverTime, setServerTime] = useState(null);

	useEffect(() => {
		fetchServerTime();
	}, []);

	const fetchServerTime = async () => {
		try {
			const response = await axios.get(`${API_URL}/current-time`);
			if (response.data.success) {
				setServerTime(new Date(response.data.currentTime));
			}
		} catch (err) {
			console.error("Loi lay thoi gian server:", err);
			setServerTime(new Date());
		}
	};

	const today = serverTime ? new Date(serverTime).toISOString().split("T")[0] : "";

	useEffect(() => {
		if (serverTime) {
			fetchShowtimes();
			fetchMovies();
		}
	}, [serverTime]);

	useEffect(() => {
		filterShowtimes();
	}, [selectedMovie, selectedDate, showtimes]);

	const fetchShowtimes = async () => {
		try {
			const response = await axios.get(`${API_URL}/showtimes`);
			if (response.data.success) {
				let showtimesData = [];
				if (response.data.data && Array.isArray(response.data.data)) {
					showtimesData = response.data.data;
				} else if (response.data.data && response.data.data.showtimes) {
					showtimesData = response.data.data.showtimes;
				} else {
					showtimesData = [];
				}

				const normalizedShowtimes = showtimesData.map((st) => {
					let showDateTime;
					let roomName;

					if (st.startTime) {
						showDateTime = new Date(st.startTime);
						roomName = st.roomName || st.room;
					} else if (st.date && st.time) {
						showDateTime = new Date(`${st.date}T${st.time}`);
						roomName = st.room;
					} else {
						showDateTime = new Date();
						roomName = "Chua co phong";
					}

					const totalSeats = st.seats?.length || st.availableSeats || 100;
					const bookedCount = st.bookedSeats?.length || 0;
					const remainingSeats = totalSeats - bookedCount;

					return {
						_id: st._id,
						movieId: st.movieId,
						room: roomName,
						dateTime: showDateTime,
						date: showDateTime,
						price: st.price,
						totalSeats: totalSeats,
						bookedSeats: st.bookedSeats || [],
						remainingSeats: remainingSeats,
					};
				});

				setShowtimes(normalizedShowtimes);
				setFilteredShowtimes(normalizedShowtimes);
			}
		} catch (error) {
			console.error("Lỗi tải suất chiếu:", error);
			setShowtimes([]);
			setFilteredShowtimes([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchMovies = async () => {
		try {
			const response = await axios.get(`${API_URL}/movies`);
			if (response.data.success) {
				let moviesData = [];
				if (response.data.data && Array.isArray(response.data.data)) {
					moviesData = response.data.data;
				} else if (response.data.data && response.data.data.movies) {
					moviesData = response.data.data.movies;
				} else {
					moviesData = [];
				}
				setMovies(moviesData);
			} else {
				setMovies([]);
			}
		} catch (error) {
			console.error("Loi tai phim:", error);
			setMovies([]);
		}
	};

	const filterShowtimes = () => {
		if (!Array.isArray(showtimes)) {
			setFilteredShowtimes([]);
			return;
		}
		
		let filtered = [...showtimes];
		if (selectedMovie) {
			filtered = filtered.filter((st) => st.movieId?._id === selectedMovie);
		}
		if (selectedDate) {
			filtered = filtered.filter((st) => {
				if (!st.date) return false;
				try {
					const showDate = new Date(st.date).toISOString().split("T")[0];
					return showDate === selectedDate;
				} catch (error) {
					return false;
				}
			});
		}
		filtered.sort((a, b) => a.dateTime - b.dateTime);
		setFilteredShowtimes(filtered);
	};

	const clearFilters = () => {
		setSelectedMovie("");
		setSelectedDate("");
	};

	const formatDate = (dateObj) => {
		if (!dateObj) return "Chua co ngay";
		try {
			return new Date(dateObj).toLocaleDateString("vi-VN", {
				weekday: "short",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		} catch (error) {
			return "Ngay khong hop le";
		}
	};

	const formatTime = (dateObj) => {
		if (!dateObj) return "Chua co gio";
		try {
			return new Date(dateObj).toLocaleTimeString("vi-VN", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (error) {
			return "Gio khong hop le";
		}
	};

	const isStillValid = (dateTime) => {
		if (!serverTime) return true;
		return dateTime > serverTime;
	};

	const groupShowtimesByMovie = () => {
		if (!Array.isArray(filteredShowtimes)) return {};
		
		const grouped = {};
		filteredShowtimes.forEach((showtime) => {
			const movieId = showtime.movieId?._id;
			if (!movieId) return;

			if (!grouped[movieId]) {
				grouped[movieId] = {
					movie: showtime.movieId,
					showtimes: [],
				};
			}

			const isValid = isStillValid(showtime.dateTime);
			const remainingSeats = showtime.remainingSeats;

			grouped[movieId].showtimes.push({
				id: showtime._id,
				time: formatTime(showtime.dateTime),
				date: formatDate(showtime.dateTime),
				fullDate: showtime.dateTime,
				room: showtime.room,
				price: showtime.price,
				remainingSeats: remainingSeats,
				totalSeats: showtime.totalSeats,
				isValid: isValid,
			});

			grouped[movieId].showtimes.sort((a, b) => a.fullDate - b.fullDate);
		});
		return grouped;
	};

	const groupedShowtimes = groupShowtimesByMovie();

	if (loading || !serverTime) {
		return <div className="loading text-center mt-5">Dang tai suat chieu...</div>;
	}

	return (
		<div className="showtime-list-container">
			<div className="container">
				<h1 className="section-title">LICH CHIEU PHIM</h1>

				<div className="filter-section">
					<div className="filter-group">
						<label>Chon phim:</label>
						<select
							value={selectedMovie}
							onChange={(e) => setSelectedMovie(e.target.value)}
							className="filter-select"
						>
							<option value="">Tat ca phim</option>
							{Array.isArray(movies) && movies.map((movie) => (
								<option key={movie._id} value={movie._id}>{movie.title}</option>
							))}
						</select>
					</div>

					<div className="filter-group">
						<label>Chon ngay:</label>
						<input
							type="date"
							value={selectedDate}
							onChange={(e) => setSelectedDate(e.target.value)}
							className="filter-date"
							min={today}
						/>
					</div>

					{(selectedMovie || selectedDate) && (
						<button className="btn btn-outline" onClick={clearFilters}>
							Xoa bo loc
						</button>
					)}
				</div>

				{Object.keys(groupedShowtimes).length === 0 ? (
					<div className="no-results-home">
						<p>Khong tim thay suat chieu nao!</p>
						<p className="no-results-suggestion">Hay thu chon phim hoac ngay khac nhe!</p>
					</div>
				) : (
					<div className="showtimes-list">
						{Object.keys(groupedShowtimes).map((movieId) => {
							const group = groupedShowtimes[movieId];
							const movie = group.movie;
							const movieShowtimes = group.showtimes;

							return (
								<div key={movieId} className="movie-showtime-group">
									<div className="movie-group-header">
										<img
											src={movie?.poster || "https://via.placeholder.com/80x120?text=No+Poster"}
											alt={movie?.title}
											className="movie-group-poster"
											onError={(e) => { e.target.src = "https://via.placeholder.com/80x120?text=No+Poster"; }}
										/>
										<div className="movie-group-info">
											<h2 className="movie-group-title">{movie?.title || "Khong xac dinh"}</h2>
											<div className="movie-group-meta">
												<span>Danh gia: {movie?.rating || "Chua danh gia"}</span>
												<span>Thoi luong: {movie?.duration || 0} phut</span>
												<span>The loai: {movie?.genre?.slice(0, 2).join(", ") || "Chua cap nhat"}</span>
											</div>
										</div>
									</div>

									<div className="showtimes-group">
										<h3 className="showtimes-group-title">CAC SUAT CHIEU</h3>
										<div className="showtimes-group-grid">
											{movieShowtimes.map((showtime, idx) => (
												<div
													key={idx}
													className={`showtime-group-card ${!showtime.isValid ? "expired-showtime" : ""}`}
													onClick={() => {
														if (showtime.isValid) {
															navigate(`/booking?showtime=${showtime.id}`);
														} else {
															alert("Suat chieu nay da qua thoi gian! Khong the dat ve.");
														}
													}}
													style={!showtime.isValid ? { opacity: 0.6, cursor: "not-allowed" } : {}}
												>
													<div className="showtime-group-time">{showtime.time}</div>
													<div className="showtime-group-date">{showtime.date}</div>
													<div className="showtime-group-room">{showtime.room}</div>
													<div className="showtime-group-price">{showtime.price?.toLocaleString()}d</div>
													<div className={`showtime-group-seats ${showtime.remainingSeats <= 10 ? "seats-low" : ""}`}>
														Con {showtime.remainingSeats}/{showtime.totalSeats} ghe
													</div>
													{!showtime.isValid && <div className="expired-badge">Het han</div>}
												</div>
											))}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ShowtimeList;