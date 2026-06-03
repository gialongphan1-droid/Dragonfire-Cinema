import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/rooms";

const RoomList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // TẠM THỜI SET isAdmin = true ĐỂ TEST
    const isAdmin = true;
    
    // Comment dòng kiểm tra cũ
    // const user = JSON.parse(localStorage.getItem("user") || "{}");
    // const isAdmin = user?.isAdmin === true || user?.role === "admin";

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setRooms(response.data.data);
            setError("");
        } catch (err) {
            setError("Không thể tải danh sách phòng chiếu");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xóa phòng "${name}"?`)) {
            try {
                const token = localStorage.getItem("token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await axios.delete(`${API_URL}/${id}`, config);
                alert("Xóa phòng thành công!");
                fetchRooms();
            } catch (err) {
                console.error("Lỗi xóa:", err);
                alert(err.response?.data?.message || "Có lỗi xảy ra khi xóa!");
            }
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            Standard: "#4caf50",
            VIP: "#ffd700",
            IMAX: "#e50914",
            "3D": "#2196f3",
            "4DX": "#9c27b0"
        };
        return colors[type] || "#b3b3b3";
    };

    const getStatusText = (status) => {
        const statusMap = {
            active: "Đang hoạt động",
            maintenance: "Đang bảo trì",
            inactive: "Ngừng hoạt động"
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="room-container">
            <div className="room-header">
                <h2 className="room-title">🎬 QUẢN LÝ PHÒNG CHIẾU</h2>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => navigate("/rooms/add")}>
                        + Thêm phòng chiếu
                    </button>
                )}
            </div>

            {rooms.length === 0 ? (
                <div className="room-empty">
                    <p>Chưa có phòng chiếu nào</p>
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => navigate("/rooms/add")}>
                            + Thêm phòng chiếu đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="room-grid">
                    {rooms.map((room) => (
                        <div key={room._id} className="room-card">
                            <div className="room-card-header" style={{ borderColor: getTypeColor(room.type) }}>
                                <h3 className="room-name">{room.name}</h3>
                                <span className="room-type" style={{ background: getTypeColor(room.type) }}>
                                    {room.type}
                                </span>
                            </div>
                            <div className="room-info">
                                <p><span className="room-label">🎭 Sức chứa:</span> {room.capacity} ghế</p>
                                <p><span className="room-label">📐 Sơ đồ:</span> {room.rows} x {room.columns}</p>
                                <p><span className="room-label">📌 Trạng thái:</span> {getStatusText(room.status)}</p>
                                {room.description && (
                                    <p><span className="room-label">📝 Mô tả:</span> {room.description}</p>
                                )}
                            </div>
                            {isAdmin && (
                                <div className="room-actions">
                                    <button className="btn-edit" onClick={() => navigate(`/rooms/edit/${room._id}`)}>
                                        ✏️ Sửa
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDelete(room._id, room.name)}>
                                        🗑️ Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoomList;