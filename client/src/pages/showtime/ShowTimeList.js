import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/showtimes";
const MOVIE_API_URL = "http://localhost:5000/api/movies";
const ROOM_API_URL = "http://localhost:5000/api/rooms";

const ShowTimeList = () => {
    const navigate = useNavigate();
    
    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]); // Lưu TẤT CẢ phòng
    const [showtimes, setShowtimes] = useState({});
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // State cho form thêm suất chiếu
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        movieId: "",
        cinemaName: "Dragonfire Cinema",
        roomId: "",
        startTime: "",
        price: ""
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    // State cho form sửa suất chiếu
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [editFormData, setEditFormData] = useState({
        startTime: "",
        price: "",
        roomId: ""
    });
    const [editLoading, setEditLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user?.isAdmin === true || user?.role === "admin";

    useEffect(() => {
        fetchData();
        if (isAdmin) {
            fetchRooms();
        }
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            const moviesRes = await axios.get(MOVIE_API_URL);
            const moviesData = moviesRes.data.data;
            setMovies(moviesData);
            
            const showtimesRes = await axios.get(API_URL);
            const showtimesData = showtimesRes.data.data;
            
            const grouped = {};
            showtimesData.forEach(showtime => {
                const movieId = showtime.movieId?._id || showtime.movieId;
                if (!grouped[movieId]) {
                    grouped[movieId] = [];
                }
                grouped[movieId].push({
                    id: showtime._id,
                    time: new Date(showtime.startTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit"
                    }),
                    date: new Date(showtime.startTime).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit"
                    }),
                    fullStartTime: showtime.startTime,
                    room: showtime.roomName,
                    roomId: showtime.roomId?._id || showtime.roomId,
                    price: showtime.price,
                    cinemaName: showtime.cinemaName
                });
            });
            
            setShowtimes(grouped);
            setError("");
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setError("Không thể tải dữ liệu từ server");
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            const response = await axios.get(ROOM_API_URL);
            // Lấy TẤT CẢ phòng
            setRooms(response.data.data);
            console.log("✅ All rooms loaded:", response.data.data);
        } catch (err) {
            console.error("Lỗi tải phòng:", err);
        }
    };

    const handleMovieClick = (movieId) => {
        if (selectedMovie === movieId) {
            setSelectedMovie(null);
        } else {
            setSelectedMovie(movieId);
        }
        setEditingShowtime(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Kiểm tra nếu chọn phòng không hoạt động
        if (name === "roomId" && value) {
            const selectedRoom = rooms.find(r => r._id === value);
            if (selectedRoom && selectedRoom.status !== "active") {
                setFormError(`⚠️ Phòng "${selectedRoom.name}" đang ${selectedRoom.status === "maintenance" ? "bảo trì" : "ngừng hoạt động"}. Không thể thêm suất chiếu!`);
                setFormData(prev => ({ ...prev, roomId: "" }));
            } else {
                setFormError("");
            }
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
        
        // Kiểm tra nếu chọn phòng không hoạt động
        if (name === "roomId" && value) {
            const selectedRoom = rooms.find(r => r._id === value);
            if (selectedRoom && selectedRoom.status !== "active") {
                alert(`⚠️ Phòng "${selectedRoom.name}" đang ${selectedRoom.status === "maintenance" ? "bảo trì" : "ngừng hoạt động"}. Không thể cập nhật suất chiếu!`);
                setEditFormData(prev => ({ ...prev, roomId: "" }));
            }
        }
    };

    const handleDeleteShowtime = async (showtimeId, showtimeTime, movieTitle) => {
        if (!window.confirm(`Bạn có chắc muốn xóa suất chiếu "${showtimeTime}" của phim "${movieTitle}"?`)) {
            return;
        }
        
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            await axios.delete(`${API_URL}/${showtimeId}`, config);
            alert("Xóa suất chiếu thành công!");
            setEditingShowtime(null);
            fetchData();
        } catch (err) {
            console.error("Lỗi xóa:", err);
            alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa!");
        }
    };

    const openEditForm = (showtime) => {
        setEditingShowtime(showtime);
        setEditFormData({
            startTime: showtime.fullStartTime?.slice(0, 16) || "",
            price: showtime.price,
            roomId: showtime.roomId || ""
        });
    };

    const handleUpdateShowtime = async (e) => {
        e.preventDefault();
        
        // Kiểm tra phòng được chọn có hoạt động không
        const selectedRoom = rooms.find(r => r._id === editFormData.roomId);
        if (selectedRoom && selectedRoom.status !== "active") {
            alert(`⚠️ Không thể cập nhật! Phòng "${selectedRoom.name}" đang ${selectedRoom.status === "maintenance" ? "bảo trì" : "ngừng hoạt động"}. Vui lòng chọn phòng khác!`);
            return;
        }
        
        setEditLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            };
            
            const payload = {
                startTime: editFormData.startTime,
                price: parseInt(editFormData.price),
                roomId: editFormData.roomId,
                roomName: selectedRoom?.name || editingShowtime.room
            };
            
            await axios.put(`${API_URL}/${editingShowtime.id}`, payload, config);
            alert("Cập nhật suất chiếu thành công!");
            setEditingShowtime(null);
            fetchData();
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
        } finally {
            setEditLoading(false);
        }
    };

    // Lấy trạng thái phòng để hiển thị
    const getRoomStatusText = (status) => {
        switch(status) {
            case "active": return "✅ Hoạt động";
            case "maintenance": return "🔧 Đang bảo trì";
            case "inactive": return "⛔ Ngừng hoạt động";
            default: return "";
        }
    };

    const handleSubmitShowtime = async (e) => {
        e.preventDefault();
        
        setFormLoading(true);
        setFormError("");
        setFormSuccess("");

        if (!formData.movieId || !formData.roomId || !formData.startTime || !formData.price) {
            setFormError("Vui lòng điền đầy đủ thông tin");
            setFormLoading(false);
            return;
        }

        // Kiểm tra phòng có hoạt động không
        const selectedRoom = rooms.find(r => r._id === formData.roomId);
        if (selectedRoom && selectedRoom.status !== "active") {
            setFormError(`⚠️ Không thể thêm suất chiếu! Phòng "${selectedRoom.name}" đang ${selectedRoom.status === "maintenance" ? "bảo trì" : "ngừng hoạt động"}.`);
            setFormLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            };

            const selectedMovieData = movies.find(m => m._id === formData.movieId);

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

            const response = await axios.post(API_URL, payload, config);
            
            setFormSuccess("Thêm suất chiếu thành công!");
            setFormData({
                movieId: "",
                cinemaName: "Dragonfire Cinema",
                roomId: "",
                startTime: "",
                price: ""
            });
            
            setTimeout(() => {
                setShowForm(false);
                fetchData();
                setFormSuccess("");
            }, 1500);
        } catch (err) {
            console.error("❌ LỖI:", err);
            setFormError(err.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setFormLoading(false);
        }
    };

    const getMovieImage = (movie) => {
        return movie.poster || "https://placehold.co/300x450/e50914/white?text=DRAGONFIRE";
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="lich-chieu-container">
            <div className="page-header">
                <h1 className="lich-chieu-title">🎬 LỊCH CHIẾU PHIM</h1>
                {isAdmin && (
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingShowtime(null);
                        }}
                    >
                        {showForm ? "Đóng form" : "+ Thêm suất chiếu"}
                    </button>
                )}
            </div>

            {/* Form thêm suất chiếu */}
            {showForm && isAdmin && (
                <div className="add-showtime-form">
                    <h3>➕ THÊM SUẤT CHIẾU MỚI</h3>
                    {formError && <div className="error-message">{formError}</div>}
                    {formSuccess && <div className="success-message">{formSuccess}</div>}
                    <form onSubmit={handleSubmitShowtime}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Chọn phim *</label>
                                <select name="movieId" value={formData.movieId} onChange={handleFormChange} required>
                                    <option value="">-- Chọn phim --</option>
                                    {movies.map(movie => (
                                        <option key={movie._id} value={movie._id}>{movie.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Chọn phòng *</label>
                                <select name="roomId" value={formData.roomId} onChange={handleFormChange} required>
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map(room => (
                                        <option key={room._id} value={room._id}>
                                            {room.name} ({room.type}) - {getRoomStatusText(room.status)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Thời gian chiếu *</label>
                                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleFormChange} required />
                            </div>
                            <div className="form-group">
                                <label>Giá vé (VNĐ) *</label>
                                <input type="number" name="price" value={formData.price} onChange={handleFormChange} placeholder="85000" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tên rạp</label>
                            <input type="text" name="cinemaName" value={formData.cinemaName} onChange={handleFormChange} />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={formLoading}>
                                {formLoading ? "Đang xử lý..." : "Thêm suất chiếu"}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Form sửa suất chiếu */}
            {editingShowtime && isAdmin && (
                <div className="edit-showtime-form">
                    <h3>✏️ SỬA SUẤT CHIẾU</h3>
                    <form onSubmit={handleUpdateShowtime}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Phim</label>
                                <input type="text" value={movies.find(m => m._id === selectedMovie)?.title || ""} disabled />
                            </div>
                            <div className="form-group">
                                <label>Chọn phòng mới</label>
                                <select name="roomId" value={editFormData.roomId} onChange={handleEditFormChange} required>
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map(room => (
                                        <option key={room._id} value={room._id}>
                                            {room.name} ({room.type}) - {getRoomStatusText(room.status)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Thời gian chiếu mới</label>
                                <input type="datetime-local" name="startTime" value={editFormData.startTime} onChange={handleEditFormChange} required />
                            </div>
                            <div className="form-group">
                                <label>Giá vé mới (VNĐ)</label>
                                <input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={editLoading}>
                                {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setEditingShowtime(null)}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {movies.length === 0 ? (
                <div className="error-message">Chưa có phim nào. Hãy thêm phim trước!</div>
            ) : (
                <div className="phim-grid">
                    {movies.map((movie) => (
                        <div key={movie._id} className="phim-card">
                            <div 
                                className="phim-image-container"
                                onClick={() => handleMovieClick(movie._id)}
                            >
                                <img 
                                    src={getMovieImage(movie)} 
                                    alt={movie.title}
                                    className="phim-image"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/300x450/e50914/white?text=${encodeURIComponent(movie.title.split(" ")[0])}`;
                                    }}
                                />
                                <div className="phim-overlay">
                                    <span className="phim-rating">⭐ {movie.rating || "N/A"}</span>
                                </div>
                            </div>
                            
                            <div className="phim-info" onClick={() => handleMovieClick(movie._id)}>
                                <h3 className="phim-ten">{movie.title}</h3>
                                <p className="phim-meta">{movie.genre?.join(", ") || "Chưa có thể loại"} • {movie.duration} phút</p>
                                <p className="phim-rap">🏠 Dragonfire Cinema</p>
                            </div>
                            
                            {selectedMovie === movie._id && (
                                <div className="suat-chieu-container">
                                    <div className="suat-chieu-header">
                                        <span className="suat-chieu-title">📅 CHỌN SUẤT CHIẾU</span>
                                    </div>
                                    <div className="suat-chieu-list-ngang">
                                        {showtimes[movie._id]?.map((suat) => (
                                            <div key={suat.id} className="suat-chieu-item-wrapper">
                                                <div 
                                                    className="suat-chieu-item-ngang"
                                                    onClick={() => navigate(`/showtimes/${suat.id}`)}
                                                >
                                                    <div className="suat-chieu-date-ngang">{suat.date}</div>
                                                    <div className="suat-chieu-time-ngang">{suat.time}</div>
                                                    <div className="suat-chieu-room-ngang">{suat.room}</div>
                                                    <div className="suat-chieu-price-ngang">{suat.price.toLocaleString()}đ</div>
                                                </div>
                                                {isAdmin && (
                                                    <div className="suat-chieu-actions">
                                                        <button 
                                                            className="btn-edit-showtime"
                                                            onClick={() => openEditForm(suat)}
                                                            title="Sửa suất chiếu"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn-delete-showtime"
                                                            onClick={() => handleDeleteShowtime(suat.id, suat.time, movie.title)}
                                                            title="Xóa suất chiếu"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {(!showtimes[movie._id] || showtimes[movie._id].length === 0) && (
                                        <p className="no-showtime">Chưa có suất chiếu cho phim này</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShowTimeList;