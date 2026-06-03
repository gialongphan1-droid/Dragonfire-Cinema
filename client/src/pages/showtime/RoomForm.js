import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api/rooms";

const RoomForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        type: "Standard",
        rows: 5,
        columns: 10,
        status: "active",
        description: "",
        amenities: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user?.isAdmin === true;

    const amenitiesList = ["Air Conditioning", "Dolby Sound", "Reclining Seats", "Food Service", "Wheelchair Access"];

    useEffect(() => {
        if (isEditMode) {
            fetchRoom();
        }
    }, [id]);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/${id}`);
            const data = response.data.data;
            setFormData({
                name: data.name || "",
                capacity: data.capacity || "",
                type: data.type || "Standard",
                rows: data.rows || 5,
                columns: data.columns || 10,
                status: data.status || "active",
                description: data.description || "",
                amenities: data.amenities || []
            });
        } catch (err) {
            setError("Không thể tải thông tin phòng");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Tự động tính capacity khi thay đổi rows/columns
        if (name === "rows" || name === "columns") {
            const rows = name === "rows" ? parseInt(value) : formData.rows;
            const cols = name === "columns" ? parseInt(value) : formData.columns;
            setFormData(prev => ({ ...prev, capacity: rows * cols }));
        }
    };

    const handleAmenityChange = (amenity) => {
        setFormData(prev => {
            if (prev.amenities.includes(amenity)) {
                return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...prev.amenities, amenity] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.name || !formData.capacity) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
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

            if (isEditMode) {
                await axios.put(`${API_URL}/${id}`, formData, config);
                setSuccess("Cập nhật phòng chiếu thành công!");
            } else {
                await axios.post(API_URL, formData, config);
                setSuccess("Thêm phòng chiếu thành công!");
                setFormData({
                    name: "",
                    capacity: "",
                    type: "Standard",
                    rows: 5,
                    columns: 10,
                    status: "active",
                    description: "",
                    amenities: []
                });
            }

            setTimeout(() => {
                navigate("/rooms");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="room-container">
                <div className="error-message">Bạn không có quyền truy cập trang này!</div>
                <button className="btn btn-primary" onClick={() => navigate("/rooms")}>Quay lại</button>
            </div>
        );
    }

    return (
        <div className="room-form">
            <h2 className="room-form-title">{isEditMode ? "✏️ CẬP NHẬT PHÒNG CHIẾU" : "➕ THÊM PHÒNG CHIẾU MỚI"}</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên phòng *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Loại phòng</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="Standard">Standard</option>
                            <option value="VIP">VIP</option>
                            <option value="IMAX">IMAX</option>
                            <option value="3D">3D</option>
                            <option value="4DX">4DX</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="active">✅ Đang hoạt động</option>
                            <option value="maintenance">🔧 Đang bảo trì</option>
                            <option value="inactive">⛔ Ngừng hoạt động</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Số hàng ghế</label>
                        <input type="number" name="rows" value={formData.rows} onChange={handleChange} min="2" max="10" />
                    </div>
                    <div className="form-group">
                        <label>Số cột ghế</label>
                        <input type="number" name="columns" value={formData.columns} onChange={handleChange} min="5" max="20" />
                    </div>
                    <div className="form-group">
                        <label>Sức chứa (ghế)</label>
                        <input type="number" name="capacity" value={formData.capacity} readOnly disabled />
                    </div>
                </div>

                <div className="form-group">
                    <label>Tiện ích</label>
                    <div className="amenities-group">
                        {amenitiesList.map(amenity => (
                            <label key={amenity} className="amenity-checkbox">
                                <input
                                    type="checkbox"
                                    checked={formData.amenities.includes(amenity)}
                                    onChange={() => handleAmenityChange(amenity)}
                                />
                                {amenity}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang xử lý..." : (isEditMode ? "Cập nhật" : "Thêm mới")}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => navigate("/rooms")}>
                        Hủy bỏ
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomForm;