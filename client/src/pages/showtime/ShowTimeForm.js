import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/showtimes";
const MOVIE_API_URL = "http://localhost:5000/api/movies";
const ROOM_API_URL = "http://localhost:5000/api/rooms";
const TIME_API_URL = "http://localhost:5000/api/current-time";

const ShowTimeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        movieId: "",
        cinemaName: "",
        roomId: "",
        startTime: "",
        price: "",
    });

    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [serverTime, setServerTime] = useState(null);

    const getToken = () => localStorage.getItem("token");

    // Lấy thời gian thực từ server
    useEffect(() => {
        fetchServerTime();
        fetchMovies();
        fetchRooms();
        if (isEditMode) {
            fetchShowtime();
        }
    }, [id]);

    const fetchServerTime = async () => {
        try {
            const response = await axios.get(TIME_API_URL);
            setServerTime(new Date(response.data.currentTime));
        } catch (err) {
            console.error("Lỗi lấy thời gian server:", err);
            setServerTime(new Date()); // fallback
        }
    };

    // Lấy thời gian hiện tại từ server (không phải local)
    const getCurrentDateTime = () => {
        if (!serverTime) return "";
        const now = new Date(serverTime);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    // Kiểm tra thời gian có hợp lệ không (dùng server time)
    const isValidTime = (dateTime) => {
        if (!dateTime || !serverTime) return false;
        const selected = new Date(dateTime);
        return selected > serverTime;
    };

    const fetchMovies = async () => {
        try {
            const response = await axios.get(MOVIE_API_URL);
            setMovies(response.data.data);
        } catch (err) {
            console.error("Lỗi tải phim:", err);
            setError("Không thể tải danh sách phim");
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await axios.get(ROOM_API_URL);
            const activeRooms = response.data.data.filter(room => room.status === "active");
            setRooms(activeRooms);
        } catch (err) {
            console.error("Lỗi tải phòng:", err);
            setError("Không thể tải danh sách phòng");
        }
    };

    const fetchShowtime = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/${id}`);
            const data = response.data.data;
            
            const startTimeFormatted = data.startTime 
                ? new Date(data.startTime).toISOString().slice(0, 16)
                : "";
            
            setFormData({
                movieId: data.movieId?._id || data.movieId || "",
                cinemaName: data.cinemaName || "",
                roomId: data.roomId?._id || data.roomId || "",
                startTime: startTimeFormatted,
                price: data.price || "",
            });
        } catch (err) {
            console.error("Lỗi:", err);
            setError("Không thể tải thông tin suất chiếu");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === "startTime" && error === "❌ Thời gian chiếu không hợp lệ! Vui lòng chọn thời gian trong tương lai.") {
            setError("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.movieId || !formData.cinemaName || !formData.roomId || !formData.startTime || !formData.price) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
            return;
        }

        if (formData.price <= 0) {
            setError("Giá vé phải lớn hơn 0");
            setLoading(false);
            return;
        }

        // ✅ KIỂM TRA THỜI GIAN DÙNG SERVER TIME
        if (!isValidTime(formData.startTime)) {
            setError("❌ Thời gian chiếu không hợp lệ! Vui lòng chọn thời gian trong tương lai.");
            setLoading(false);
            return;
        }

        try {
            const token = getToken();
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const selectedMovieData = movies.find(m => m._id === formData.movieId);
            const selectedRoom = rooms.find(r => r._id === formData.roomId);

            const payload = {
                movieId: formData.movieId,
                movieTitle: selectedMovieData?.title,
                cinemaName: formData.cinemaName,
                roomId: formData.roomId,
                roomName: selectedRoom?.name,
                startTime: formData.startTime,
                price: parseInt(formData.price),
                seats: []
            };

            if (isEditMode) {
                await axios.put(`${API_URL}/${id}`, payload, config);
                setSuccess("Cập nhật suất chiếu thành công!");
            } else {
                await axios.post(API_URL, payload, config);
                setSuccess("Thêm suất chiếu thành công!");
                
                setFormData({
                    movieId: "",
                    cinemaName: "",
                    roomId: "",
                    startTime: "",
                    price: "",
                });
            }

            setTimeout(() => {
                navigate("/showtimes");
            }, 2000);

        } catch (err) {
            console.error("Lỗi:", err);
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user?.isAdmin === true;

    if (!isAdmin) {
        return (
            <div className="showtime-container">
                <div className="error-message">
                    ⚠️ Bạn không có quyền truy cập trang này.
                </div>
                <button className="btn btn-primary mt-3" onClick={() => navigate("/showtimes")}>
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="showtime-form">
            <h2 className="showtime-form-title">
                {isEditMode ? "✏️ CẬP NHẬT SUẤT CHIẾU" : "➕ THÊM SUẤT CHIẾU MỚI"}
            </h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="showtime-form-group">
                    <label>Chọn phim *</label>
                    <select name="movieId" value={formData.movieId} onChange={handleChange} required>
                        <option value="">-- Chọn phim --</option>
                        {movies.map((movie) => (
                            <option key={movie._id} value={movie._id}>
                                {movie.title} ({movie.duration} phút)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="showtime-form-group">
                    <label>Tên rạp *</label>
                    <input type="text" name="cinemaName" value={formData.cinemaName} onChange={handleChange} required />
                </div>

                <div className="showtime-form-group">
                    <label>Chọn phòng chiếu *</label>
                    <select name="roomId" value={formData.roomId} onChange={handleChange} required>
                        <option value="">-- Chọn phòng --</option>
                        {rooms.map((room) => (
                            <option key={room._id} value={room._id}>
                                {room.name} ({room.type} - {room.capacity} ghế) - ✅ Hoạt động
                            </option>
                        ))}
                    </select>
                </div>

                <div className="showtime-form-group">
                    <label>Thời gian chiếu *</label>
                    <input 
                        type="datetime-local" 
                        name="startTime" 
                        value={formData.startTime} 
                        onChange={handleChange} 
                        min={getCurrentDateTime()}
                        required 
                    />
                    <small style={{ color: "var(--text-secondary)", fontSize: "12px", display: "block", marginTop: "5px" }}>
                        ⏰ Chỉ được chọn thời gian trong tương lai (sau thời điểm hiện tại trên server)
                    </small>
                </div>

                <div className="showtime-form-group">
                    <label>Giá vé (VNĐ) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="1000" required />
                </div>

                <div className="showtime-form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Thêm mới")}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => navigate("/showtimes")}>
                        Hủy bỏ
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShowTimeForm;