import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const VoucherAdmin = () => {
	const [vouchers, setVouchers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingVoucher, setEditingVoucher] = useState(null);
	const [errors, setErrors] = useState({});
	const [formData, setFormData] = useState({
		code: "",
		name: "",
		description: "",
		discountType: "percent",
		discountValue: "",
		applicableTo: "total",
		applicableTicketTypes: ["all"],
		applicableSeatTypes: ["all"],
		minOrderValue: "",
		maxDiscount: "",
		quantity: "",
		startDate: "",
		endDate: "",
	});

	const token = localStorage.getItem("accessToken");
	const today = new Date().toISOString().split("T")[0];

	// Sử dụng useCallback để tránh re-render không cần thiết
	const fetchVouchers = useCallback(async () => {
		try {
			const response = await axios.get(`${API_URL}/vouchers`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				setVouchers(response.data.data);
			}
		} catch (error) {
			console.error("Lỗi tải voucher:", error);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		fetchVouchers();
	}, [fetchVouchers]);

	const getApplicableText = (voucher) => {
		if (voucher.applicableTo === "total") return "Tổng hóa đơn";
		if (voucher.applicableTo === "ticket") {
			const types = voucher.applicableTicketTypes;
			if (!types || types.length === 0 || types.includes("all"))
				return "Tất cả vé";
			const map = {
				adult: "Người lớn",
				student: "HSSV - U22",
				senior: "Người cao tuổi",
			};
			return types.map((t) => map[t] || t).join(", ");
		}
		if (voucher.applicableTo === "seat") {
			const types = voucher.applicableSeatTypes;
			if (!types || types.length === 0 || types.includes("all"))
				return "Tất cả ghế";
			const map = { normal: "Ghế thường", vip: "Ghế VIP", couple: "Ghế đôi" };
			return types.map((t) => map[t] || t).join(", ");
		}
		return "Không xác định";
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.code.trim())
			newErrors.code = "Mã voucher không được để trống!";
		if (!formData.name.trim())
			newErrors.name = "Tên voucher không được để trống!";
		if (!formData.discountValue)
			newErrors.discountValue = "Giá trị giảm không được để trống!";
		if (!formData.startDate)
			newErrors.startDate = "Ngày bắt đầu không được để trống!";
		if (!formData.endDate)
			newErrors.endDate = "Ngày kết thúc không được để trống!";
		if (formData.discountValue <= 0)
			newErrors.discountValue = "Giá trị giảm phải lớn hơn 0!";
		if (formData.discountType === "percent" && formData.discountValue > 100) {
			newErrors.discountValue = "Giảm giá phần trăm không được vượt quá 100%!";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const clearFieldError = (fieldName) => {
		if (errors[fieldName]) {
			setErrors((prev) => ({ ...prev, [fieldName]: "" }));
		}
	};

	const resetForm = () => {
		setFormData({
			code: "",
			name: "",
			description: "",
			discountType: "percent",
			discountValue: "",
			applicableTo: "total",
			applicableTicketTypes: ["all"],
			applicableSeatTypes: ["all"],
			minOrderValue: "",
			maxDiscount: "",
			quantity: "",
			startDate: "",
			endDate: "",
		});
		setEditingVoucher(null);
		setErrors({});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const config = { headers: { Authorization: `Bearer ${token}` } };

			const payload = {
				code: formData.code,
				name: formData.name,
				description: formData.description || "",
				discountType: formData.discountType,
				discountValue: Number(formData.discountValue),
				applicableTo: formData.applicableTo,
				applicableTicketTypes: formData.applicableTicketTypes || ["all"],
				applicableSeatTypes: formData.applicableSeatTypes || ["all"],
				minOrderValue: Number(formData.minOrderValue) || 0,
				maxDiscount: Number(formData.maxDiscount) || 0,
				quantity: Number(formData.quantity) || 0,
				startDate: formData.startDate,
				endDate: formData.endDate,
			};

			let response;
			if (editingVoucher) {
				response = await axios.put(
					`${API_URL}/vouchers/${editingVoucher._id}`,
					payload,
					config,
				);
			} else {
				response = await axios.post(
					`${API_URL}/vouchers/create`,
					payload,
					config,
				);
			}

			if (response.data.success) {
				alert(response.data.message);
				setShowModal(false);
				resetForm();
				fetchVouchers();
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Bạn có chắc muốn xóa voucher này?")) return;
		try {
			const response = await axios.delete(`${API_URL}/vouchers/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (response.data.success) {
				alert(response.data.message);
				fetchVouchers();
			}
		} catch (error) {
			alert(error.response?.data?.message || "Có lỗi xảy ra");
		}
	};

	const handleEdit = (voucher) => {
		setEditingVoucher(voucher);
		setErrors({});
		setFormData({
			code: voucher.code,
			name: voucher.name,
			description: voucher.description || "",
			discountType: voucher.discountType,
			discountValue: voucher.discountValue,
			applicableTo: voucher.applicableTo || "total",
			applicableTicketTypes: voucher.applicableTicketTypes || ["all"],
			applicableSeatTypes: voucher.applicableSeatTypes || ["all"],
			minOrderValue: voucher.minOrderValue ?? "",
			maxDiscount: voucher.maxDiscount ?? "",
			quantity: voucher.quantity ?? "",
			startDate: voucher.startDate?.split("T")[0] || "",
			endDate: voucher.endDate?.split("T")[0] || "",
		});
		setShowModal(true);
	};

	const handleAddNew = () => {
		resetForm();
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		resetForm();
	};

	if (loading)
		return <div className="loading text-center mt-5">Đang tải...</div>;

	return (
		<div className="admin-voucher-container">
			<div className="admin-header">
				<h1>Quản Lý Voucher</h1>
				<button className="btn btn-primary" onClick={handleAddNew}>
					+ Thêm Voucher Mới
				</button>
			</div>

			<div className="admin-table">
				<table className="admin-table">
					<thead>
						<tr>
							<th>STT</th>
							<th>Mã</th>
							<th>Tên</th>
							<th>Giảm giá</th>
							<th>Áp dụng cho</th>
							<th>Đối tượng</th>
							<th>Đơn hàng tối thiểu</th>
							<th>Số lượng</th>
							<th>Ngày hiệu lực</th>
							<th>Trạng thái</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{vouchers.map((voucher, index) => (
							<tr key={voucher._id}>
								<td>{index + 1}</td>
								<td>
									<strong>{voucher.code}</strong>
								</td>
								<td>{voucher.name}</td>
								<td>
									{voucher.discountType === "percent"
										? `${voucher.discountValue || 0}%`
										: voucher.discountType === "final_price"
											? `Còn ${voucher.discountValue ? voucher.discountValue.toLocaleString() : 0}đ`
											: `${voucher.discountValue ? voucher.discountValue.toLocaleString() : 0}đ`}
								</td>
								<td>
									{voucher.applicableTo === "total" && "📦 Tổng hóa đơn"}
									{voucher.applicableTo === "ticket" && "🎫 Vé"}
									{voucher.applicableTo === "seat" && "💺 Ghế"}
								</td>
								<td>{getApplicableText(voucher)}</td>
								<td>
									{voucher.minOrderValue
										? voucher.minOrderValue.toLocaleString()
										: 0}
									đ
								</td>
								<td>
									{voucher.usedCount}/{voucher.quantity || "∞"}
								</td>
								<td>
									{voucher.startDate
										? new Date(voucher.startDate).toLocaleDateString("vi-VN")
										: "???"}{" "}
									-
									{voucher.endDate
										? new Date(voucher.endDate).toLocaleDateString("vi-VN")
										: "???"}
								</td>
								<td>
									<span className={`status ${voucher.status}`}>
										{voucher.status === "active"
											? "Hoạt động"
											: "Không hoạt động"}
									</span>
								</td>
								<td>
									<button
										className="btn btn-outline"
										onClick={() => handleEdit(voucher)}
									>
										Sửa
									</button>
									<button
										className="btn"
										style={{ background: "var(--error-color)" }}
										onClick={() => handleDelete(voucher._id)}
									>
										Xóa
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{showModal && (
				<div className="modal-overlay" onClick={handleCloseModal}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<h2>{editingVoucher ? "✏️ Sửa Voucher" : "➕ Thêm Voucher Mới"}</h2>

						{Object.keys(errors).length > 0 && (
							<div className="error-summary">
								<strong>Vui lòng kiểm tra các lỗi sau:</strong>
								<ul>
									{Object.values(errors).map((error, idx) => (
										<li key={idx}>{error}</li>
									))}
								</ul>
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>Mã voucher *</label>
								<input
									type="text"
									className={`form-control ${errors.code ? "error" : ""}`}
									value={formData.code}
									onChange={(e) => {
										setFormData({
											...formData,
											code: e.target.value.toUpperCase(),
										});
										clearFieldError("code");
									}}
									placeholder="Ví dụ: GIAMCONG1000"
									required
								/>
								{errors.code && (
									<span className="error-text">{errors.code}</span>
								)}
							</div>

							<div className="form-group">
								<label>Tên voucher *</label>
								<input
									type="text"
									className={`form-control ${errors.name ? "error" : ""}`}
									value={formData.name}
									onChange={(e) => {
										setFormData({ ...formData, name: e.target.value });
										clearFieldError("name");
									}}
									placeholder="Ví dụ: Khuyến mãi đặc biệt"
									required
								/>
								{errors.name && (
									<span className="error-text">{errors.name}</span>
								)}
							</div>

							<div className="form-group">
								<label>Mô tả</label>
								<textarea
									className="form-control"
									rows="2"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Mô tả chi tiết về voucher..."
								/>
							</div>

							<div className="form-group">
								<label>Áp dụng cho *</label>
								<select
									className="form-control"
									value={formData.applicableTo}
									onChange={(e) =>
										setFormData({ ...formData, applicableTo: e.target.value })
									}
								>
									<option value="total">📦 Tổng hóa đơn</option>
									<option value="ticket">🎫 Vé (theo loại vé)</option>
									<option value="seat">💺 Ghế (theo loại ghế)</option>
								</select>
								<small>Chọn đối tượng sẽ được giảm giá</small>
							</div>

							{formData.applicableTo === "ticket" && (
								<div className="form-group">
									<label>Loại vé được áp dụng *</label>
									<select
										className="form-control"
										value={formData.applicableTicketTypes?.[0] || "all"}
										onChange={(e) =>
											setFormData({
												...formData,
												applicableTicketTypes: [e.target.value],
											})
										}
									>
										<option value="all">Tất cả loại vé</option>
										<option value="adult">Người lớn (69.000đ)</option>
										<option value="student">HSSV - U22 (49.000đ)</option>
										<option value="senior">Người cao tuổi (50.000đ)</option>
									</select>
									<small>Chỉ áp dụng cho loại vé đã chọn</small>
								</div>
							)}

							{formData.applicableTo === "seat" && (
								<div className="form-group">
									<label>Loại ghế được áp dụng *</label>
									<select
										className="form-control"
										value={formData.applicableSeatTypes?.[0] || "all"}
										onChange={(e) =>
											setFormData({
												...formData,
												applicableSeatTypes: [e.target.value],
											})
										}
									>
										<option value="all">Tất cả loại ghế</option>
										<option value="normal">Ghế thường</option>
										<option value="vip">Ghế VIP (120.000đ)</option>
										<option value="couple">Ghế đôi (180.000đ)</option>
									</select>
									<small>Chỉ áp dụng cho loại ghế đã chọn</small>
								</div>
							)}

							<div className="form-row">
								<div className="form-group">
									<label>Loại giảm giá *</label>
									<select
										className="form-control"
										value={formData.discountType}
										onChange={(e) =>
											setFormData({ ...formData, discountType: e.target.value })
										}
									>
										<option value="percent">Phần trăm (%)</option>
										<option value="fixed">Số tiền cố định</option>
										<option value="final_price">Giá cố định sau giảm</option>
									</select>
								</div>
								<div className="form-group">
									<label>Giá trị giảm *</label>
									<input
										type="number"
										className={`form-control ${errors.discountValue ? "error" : ""}`}
										value={formData.discountValue}
										onChange={(e) => {
											setFormData({
												...formData,
												discountValue: e.target.value,
											});
											clearFieldError("discountValue");
										}}
										min="1"
										required
									/>
									{errors.discountValue && (
										<span className="error-text">{errors.discountValue}</span>
									)}
									<small>
										{formData.discountType === "final_price"
											? "Nhập giá mong muốn sau giảm (VD: 1000)"
											: formData.discountType === "percent"
												? "Nhập phần trăm giảm (VD: 20)"
												: "Nhập số tiền giảm (VD: 50000)"}
									</small>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Đơn hàng tối thiểu (đ)</label>
									<input
										type="number"
										className="form-control"
										value={formData.minOrderValue}
										onChange={(e) =>
											setFormData({
												...formData,
												minOrderValue: e.target.value,
											})
										}
										min="0"
										placeholder="0"
									/>
									<small>Để 0 nếu không giới hạn</small>
								</div>
								<div className="form-group">
									<label>Giảm tối đa (đ)</label>
									<input
										type="number"
										className="form-control"
										value={formData.maxDiscount}
										onChange={(e) =>
											setFormData({ ...formData, maxDiscount: e.target.value })
										}
										min="0"
										placeholder="0"
									/>
									<small>Chỉ áp dụng cho %, để 0 nếu không giới hạn</small>
								</div>
							</div>

							<div className="form-group">
								<label>Số lượng (0 = không giới hạn)</label>
								<input
									type="number"
									className="form-control"
									value={formData.quantity}
									onChange={(e) =>
										setFormData({ ...formData, quantity: e.target.value })
									}
									min="0"
								/>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Ngày bắt đầu *</label>
									<input
										type="date"
										className={`form-control ${errors.startDate ? "error" : ""}`}
										value={formData.startDate}
										onChange={(e) => {
											setFormData({ ...formData, startDate: e.target.value });
											clearFieldError("startDate");
										}}
										min={today}
										required
									/>
									{errors.startDate && (
										<span className="error-text">{errors.startDate}</span>
									)}
								</div>
								<div className="form-group">
									<label>Ngày kết thúc *</label>
									<input
										type="date"
										className={`form-control ${errors.endDate ? "error" : ""}`}
										value={formData.endDate}
										onChange={(e) => {
											setFormData({ ...formData, endDate: e.target.value });
											clearFieldError("endDate");
										}}
										min={formData.startDate || today}
										required
									/>
									{errors.endDate && (
										<span className="error-text">{errors.endDate}</span>
									)}
								</div>
							</div>

							<div className="modal-actions">
								<button
									type="button"
									className="btn btn-outline"
									onClick={handleCloseModal}
								>
									Hủy
								</button>
								<button type="submit" className="btn btn-primary">
									{editingVoucher ? "Cập nhật" : "Thêm mới"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default VoucherAdmin;