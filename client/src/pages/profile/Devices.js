import React, { useState, useEffect } from "react";
import authService from "../../services/authService";

const Devices = () => {
	const [devices, setDevices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchDevices();
	}, []);

	const fetchDevices = async () => {
		try {
			setLoading(true);
			const response = await authService.getDevices();
			if (response.success) {
				setDevices(response.data);
			} else {
				setError("Không thể tải danh sách thiết bị");
			}
		} catch (err) {
			setError("Có lỗi xảy ra!");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleRevoke = async (deviceId, deviceName) => {
		if (window.confirm(`Bạn có chắc muốn thu hồi thiết bị "${deviceName}"?`)) {
			try {
				const response = await authService.revokeDevice(deviceId);
				if (response.success) {
					alert("Đã thu hồi thiết bị thành công!");
					fetchDevices();
				} else {
					alert(response.message);
				}
			} catch (err) {
				alert(err.response?.data?.message || "Có lỗi xảy ra!");
			}
		}
	};

	const getDeviceIcon = (type) => {
		switch (type) {
			case "mobile":
				return "📱";
			case "tablet":
				return "📲";
			case "desktop":
				return "💻";
			default:
				return "🖥️";
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleString("vi-VN");
	};

	if (loading) {
		return (
			<div className="loading" style={{ textAlign: "center", padding: "50px" }}>
				Đang tải...
			</div>
		);
	}

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
			<h2 style={{ color: "#e50914", marginBottom: "10px" }}>
				📱 Quản lý thiết bị
			</h2>
			<p style={{ color: "#666", marginBottom: "30px" }}>
				Danh sách các thiết bị đang đăng nhập vào tài khoản của bạn
			</p>

			{error && (
				<div
					style={{
						background: "#ffebee",
						color: "#e50914",
						padding: "10px",
						borderRadius: "8px",
						marginBottom: "20px",
					}}
				>
					⚠️ {error}
				</div>
			)}

			{devices.length === 0 ? (
				<div
					style={{
						textAlign: "center",
						padding: "50px",
						background: "#f5f5f5",
						borderRadius: "12px",
					}}
				>
					<p>Không có thiết bị nào đang đăng nhập.</p>
				</div>
			) : (
				<div>
					{devices.map((device) => (
						<div
							key={device.id}
							style={{
								border: device.isCurrentDevice
									? "2px solid #4caf50"
									: "1px solid #ddd",
								borderRadius: "12px",
								padding: "16px",
								marginBottom: "15px",
								background: device.isCurrentDevice ? "#f0fff4" : "white",
								position: "relative",
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<div
									style={{ display: "flex", alignItems: "center", gap: "12px" }}
								>
									<span style={{ fontSize: "32px" }}>
										{getDeviceIcon(device.deviceType)}
									</span>
									<div>
										<div style={{ fontWeight: "bold", fontSize: "16px" }}>
											{device.deviceName}
											{device.isCurrentDevice && (
												<span
													style={{
														background: "#4caf50",
														color: "white",
														padding: "2px 10px",
														borderRadius: "20px",
														fontSize: "11px",
														marginLeft: "10px",
													}}
												>
													Thiết bị này
												</span>
											)}
										</div>
										<div
											style={{
												color: "#666",
												fontSize: "13px",
												marginTop: "5px",
											}}
										>
											<div>🔍 {device.browser}</div>
											<div>🌐 IP: {device.ipAddress || "Không xác định"}</div>
											<div>
												📅 Hoạt động lần cuối: {formatDate(device.lastActive)}
											</div>
										</div>
									</div>
								</div>
								{!device.isCurrentDevice && (
									<button
										onClick={() => handleRevoke(device.id, device.deviceName)}
										style={{
											background: "#e50914",
											color: "white",
											border: "none",
											padding: "8px 16px",
											borderRadius: "8px",
											cursor: "pointer",
											fontSize: "13px",
										}}
									>
										Thu hồi
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Devices;
