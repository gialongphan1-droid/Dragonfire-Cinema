import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import authService from "../../services/authService";

const API_URL = "http://localhost:5000/api";

const Profile = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [message, setMessage] = useState({ type: "", text: "" });
	const [points, setPoints] = useState(0);
	const [rank, setRank] = useState("");
	const [isChangingEmail, setIsChangingEmail] = useState(false);
	const [verificationSent, setVerificationSent] = useState(false);
	const [newEmail, setNewEmail] = useState("");

	useEffect(() => {
		fetchProfile();
		fetchPoints();
	}, []);

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const response = await authService.getProfile();
			if (response.success) {
				const userData = response.data.user;
				setUser(userData);
				setFormData({
					name: userData.name || "",
					email: userData.email || "",
				});
			} else {
				setMessage({ type: "error", text: "Không thể tải thông tin!" });
			}
		} catch (error) {
			console.error("Lỗi tải profile:", error);
			setMessage({ type: "error", text: "Có lỗi xảy ra!" });
		} finally {
			setLoading(false);
		}
	};

	const fetchPoints = async () => {
		try {
			const response = await authService.getPoints();
			if (response.success) {
				setPoints(response.data.points);
				setRank(response.data.rank);
			}
		} catch (error) {
			console.error("Lỗi tải điểm:", error);
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		setMessage({ type: "", text: "" });

		// Nếu email thay đổi, cần xác thực
		if (formData.email !== user?.email) {
			setIsChangingEmail(true);
			setNewEmail(formData.email);
			setMessage({
				type: "info",
				text: `Vui lòng xác thực email mới: ${formData.email}. Một link xác thực đã được gửi đến email của bạn.`,
			});

			try {
				// Gửi yêu cầu xác thực email mới
				const response = await axios.post(
					`${API_URL}/auth/request-email-change`,
					{
						newEmail: formData.email,
						currentEmail: user?.email,
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
						},
					},
				);

				if (response.data.success) {
					setVerificationSent(true);
					setEditing(false);
				} else {
					setMessage({ type: "error", text: response.data.message });
					setIsChangingEmail(false);
				}
			} catch (error) {
				setMessage({
					type: "error",
					text:
						error.response?.data?.message ||
						"Có lỗi xảy ra khi gửi yêu cầu xác thực!",
				});
				setIsChangingEmail(false);
			}
			return;
		}

		// Nếu chỉ đổi tên, cập nhật trực tiếp
		try {
			const response = await authService.updateProfile(
				formData.name,
				user?.email,
			);
			if (response.success) {
				const currentUser = authService.getCurrentUser();
				const updatedUser = { ...currentUser, name: formData.name };
				localStorage.setItem("user", JSON.stringify(updatedUser));
				window.dispatchEvent(new Event("userUpdated"));
				setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
				setEditing(false);
				fetchProfile();
			} else {
				setMessage({
					type: "error",
					text: response.message || "Cập nhật thất bại!",
				});
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: error.response?.data?.message || "Có lỗi xảy ra!",
			});
		}
	};

	const getRankIcon = () => {
		switch (rank) {
			case "DIAMOND":
				return "💎";
			case "GOLD":
				return "🥇";
			case "SILVER":
				return "🥈";
			default:
				return "🥉";
		}
	};

	if (loading) {
		return (
			<div className="loading text-center mt-5">Đang tải thông tin...</div>
		);
	}

	return (
		<div className="profile-container">
			<div className="container">
				<h1 className="section-title">👤 THÔNG TIN CÁ NHÂN</h1>

				{message.text && (
					<div
						className={`message ${message.type}`}
						style={{
							padding: "10px",
							borderRadius: "8px",
							marginBottom: "20px",
							background:
								message.type === "success"
									? "#e8f5e9"
									: message.type === "info"
										? "#e3f2fd"
										: "#ffebee",
							color:
								message.type === "success"
									? "#4caf50"
									: message.type === "info"
										? "#2196f3"
										: "#e50914",
							textAlign: "center",
						}}
					>
						{message.text}
					</div>
				)}

				{verificationSent && (
					<div
						style={{
							background: "#e3f2fd",
							padding: "15px",
							borderRadius: "8px",
							marginBottom: "20px",
							textAlign: "center",
							border: "1px solid #2196f3",
						}}
					>
						📧 <strong>Đã gửi email xác thực!</strong>
						<p style={{ marginTop: "10px" }}>
							Vui lòng kiểm tra email <strong>{newEmail}</strong> và click vào
							link xác thực để hoàn tất đổi email.
						</p>
						<small style={{ color: "#666" }}>
							Link có hiệu lực trong 1 giờ.
						</small>
					</div>
				)}

				<div
					className="profile-content"
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "30px",
						background: "var(--surface-color)",
						borderRadius: "16px",
						padding: "30px",
					}}
				>
					{/* Thông tin user */}
					<div className="profile-info">
						<h3 style={{ color: "var(--primary-color)", marginBottom: "20px" }}>
							📋 Thông tin tài khoản
						</h3>

						{!editing ? (
							<div>
								<div
									style={{
										marginBottom: "15px",
										padding: "10px",
										background: "rgba(255,255,255,0.05)",
										borderRadius: "8px",
									}}
								>
									<div
										style={{ color: "var(--text-secondary)", fontSize: "12px" }}
									>
										Họ và tên
									</div>
									<div style={{ fontSize: "18px", fontWeight: "bold" }}>
										{user?.name}
									</div>
								</div>
								<div
									style={{
										marginBottom: "15px",
										padding: "10px",
										background: "rgba(255,255,255,0.05)",
										borderRadius: "8px",
									}}
								>
									<div
										style={{ color: "var(--text-secondary)", fontSize: "12px" }}
									>
										Email
									</div>
									<div style={{ fontSize: "18px" }}>{user?.email}</div>
									{isChangingEmail && (
										<div
											style={{
												fontSize: "12px",
												color: "#ff9800",
												marginTop: "5px",
											}}
										>
											⏳ Đang chờ xác thực email mới...
										</div>
									)}
								</div>
								<div
									style={{
										marginBottom: "15px",
										padding: "10px",
										background: "rgba(255,255,255,0.05)",
										borderRadius: "8px",
									}}
								>
									<div
										style={{ color: "var(--text-secondary)", fontSize: "12px" }}
									>
										Vai trò
									</div>
									<div style={{ fontSize: "18px" }}>
										{user?.role === "admin"
											? "👑 Quản trị viên"
											: "👤 Người dùng"}
									</div>
								</div>
								<div
									style={{
										marginBottom: "15px",
										padding: "10px",
										background: "rgba(255,255,255,0.05)",
										borderRadius: "8px",
									}}
								>
									<div
										style={{ color: "var(--text-secondary)", fontSize: "12px" }}
									>
										Trạng thái
									</div>
									<div
										style={{
											fontSize: "18px",
											color: user?.isVerified ? "#4caf50" : "#ff9800",
										}}
									>
										{user?.isVerified
											? "✅ Đã xác thực email"
											: "⚠️ Chưa xác thực email"}
									</div>
								</div>
								<button
									onClick={() => setEditing(true)}
									disabled={isChangingEmail}
									style={{
										background: "var(--primary-color)",
										color: "white",
										border: "none",
										padding: "10px 20px",
										borderRadius: "8px",
										cursor: isChangingEmail ? "not-allowed" : "pointer",
										marginTop: "10px",
										opacity: isChangingEmail ? 0.6 : 1,
									}}
								>
									✏️ Chỉnh sửa
								</button>
							</div>
						) : (
							<form onSubmit={handleUpdate}>
								<div className="form-group">
									<label>Họ và tên</label>
									<input
										type="text"
										className="form-control"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
									/>
								</div>
								<div className="form-group">
									<label>Email</label>
									<input
										type="email"
										className="form-control"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
										required
									/>
									<small style={{ color: "#ff9800" }}>
										⚠️ Nếu đổi email, bạn cần xác thực email mới trước khi cập
										nhật.
									</small>
								</div>
								<div
									style={{ display: "flex", gap: "10px", marginTop: "20px" }}
								>
									<button type="submit" className="btn btn-primary">
										Lưu
									</button>
									<button
										type="button"
										className="btn btn-outline"
										onClick={() => {
											setEditing(false);
											setFormData({ name: user?.name, email: user?.email });
										}}
									>
										Hủy
									</button>
								</div>
							</form>
						)}
					</div>

					{/* Điểm thưởng */}
					<div className="profile-points">
						<h3 style={{ color: "var(--primary-color)", marginBottom: "20px" }}>
							⭐ Điểm thưởng
						</h3>
						<div
							style={{
								background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
								borderRadius: "16px",
								padding: "30px",
								textAlign: "center",
								color: "white",
							}}
						>
							<div style={{ fontSize: "60px", marginBottom: "10px" }}>
								{getRankIcon()}
							</div>
							<div
								style={{
									fontSize: "48px",
									fontWeight: "bold",
									marginBottom: "10px",
								}}
							>
								{points}
							</div>
							<div style={{ fontSize: "18px", marginBottom: "5px" }}>điểm</div>
							<div
								style={{
									display: "inline-block",
									padding: "5px 15px",
									background: "rgba(255,255,255,0.2)",
									borderRadius: "20px",
									marginTop: "15px",
									fontWeight: "bold",
								}}
							>
								{getRankIcon()} Hạng {rank}
							</div>
						</div>
						<div
							style={{
								marginTop: "20px",
								padding: "15px",
								background: "rgba(255,255,255,0.05)",
								borderRadius: "12px",
							}}
						>
							<h4
								style={{ color: "var(--accent-color)", marginBottom: "10px" }}
							>
								🎯 Cách tích điểm
							</h4>
							<ul
								style={{
									color: "var(--text-secondary)",
									lineHeight: "1.8",
									paddingLeft: "20px",
								}}
							>
								<li>💰 Mỗi 1.000đ = 1 điểm thưởng</li>
								<li>🎬 Đặt vé càng nhiều, điểm càng cao</li>
								<li>⭐ Hạng càng cao, ưu đãi càng lớn</li>
							</ul>
						</div>
					</div>
				</div>

				<div
					style={{
						marginTop: "30px",
						display: "flex",
						justifyContent: "center",
						gap: "15px",
					}}
				>
					<button
						onClick={() => navigate("/change-password")}
						style={{
							background: "#ff9800",
							color: "white",
							border: "none",
							padding: "12px 24px",
							borderRadius: "8px",
							cursor: "pointer",
						}}
					>
						🔐 Đổi mật khẩu
					</button>
					<button
						onClick={() => navigate("/devices")}
						style={{
							background: "#2196f3",
							color: "white",
							border: "none",
							padding: "12px 24px",
							borderRadius: "8px",
							cursor: "pointer",
						}}
					>
						📱 Quản lý thiết bị
					</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;
