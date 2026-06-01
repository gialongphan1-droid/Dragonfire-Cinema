import React, { useEffect, useState } from "react";
import authService from "../../services/authService";
import Header from "../Header";
import Footer from "../Footer";

const Home = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await authService.getProfile();
				if (data && data.success) {
					setUser(data.user);
				} else {
					window.location.href = "/login";
				}
			} catch (err) {
				authService.logout();
				window.location.href = "/login";
			}
		};
		loadProfile();
	}, []);

	if (!user)
		return (
			<div
				style={{
					padding: "40px",
					textAlign: "center",
					color: "var(--text-secondary)",
				}}
			>
				Đang tải thông tin tài khoản...
			</div>
		);

	return (
		<div
			style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
		>
			<Header />

			<div
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px 20px",
				}}
			>
				<h2 style={{ marginBottom: "24px", letterSpacing: "1px" }}>
					Chào mừng thành viên, {user.name}!
				</h2>

				<div
					style={{
						backgroundColor: "var(--surface-color)",
						borderLeft: "5px solid var(--primary-color)",
						padding: "30px",
						borderRadius: "12px",
						width: "100%",
						maxWidth: "400px",
						boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
					}}
				>
					<h3
						style={{
							color: "var(--primary-color)",
							marginBottom: "15px",
							letterSpacing: "2px",
						}}
					>
						DRAGONFIRE VIP CARD
					</h3>
					<hr style={{ borderColor: "#333", marginBottom: "20px" }} />

					<p style={{ marginBottom: "12px", fontSize: "18px" }}>
						<span style={{ color: "var(--text-secondary)" }}>Hạng thẻ: </span>
						<span
							style={{
								color: "var(--accent-color)",
								fontWeight: "bold",
								textTransform: "uppercase",
							}}
						>
							{user.rank}
						</span>
					</p>

					<p style={{ marginBottom: "12px", fontSize: "18px" }}>
						<span style={{ color: "var(--text-secondary)" }}>
							Điểm tích lũy:{" "}
						</span>
						<span style={{ color: "#4CAF50", fontWeight: "bold" }}>
							{user.points} P
						</span>
					</p>

					<p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
						<span>Email: </span> {user.email}
					</p>
				</div>

				<button
					onClick={() => {
						authService.logout();
						window.location.href = "/login";
					}}
					style={{ marginTop: "24px", width: "100%", maxWidth: "400px" }}
				>
					Đăng xuất tài khoản
				</button>
			</div>

			<Footer />
		</div>
	);
};

export default Home;
