import React, { useState } from "react";
import authService from "../../services/authService";
import Header from "../Header";
import Footer from "../Footer";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const data = await authService.login(email, password);
			if (data.success) {
				window.location.href = "/home";
			}
		} catch (err) {
			alert(err.response?.data?.message || "Đăng nhập thất bại!");
		}
	};

	return (
		<div
			style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
		>
			<Header />

			<div
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "40px 20px",
				}}
			>
				<div
					style={{
						backgroundColor: "var(--surface-color)",
						padding: "40px",
						borderRadius: "12px",
						width: "100%",
						maxWidth: "400px",
						boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
						border: "1px solid #2a2a2a",
					}}
				>
					<h2
						style={{
							textAlign: "center",
							marginBottom: "30px",
							letterSpacing: "1px",
						}}
					>
						ĐĂNG NHẬP
					</h2>

					<form
						onSubmit={handleLogin}
						style={{ display: "flex", flexDirection: "column", gap: "20px" }}
					>
						<div
							style={{ display: "flex", flexDirection: "column", gap: "8px" }}
						>
							<label
								style={{ fontSize: "14px", color: "var(--text-secondary)" }}
							>
								Email
							</label>
							<input
								type="email"
								placeholder="Nhập địa chỉ email"
								onChange={(e) => setEmail(e.target.value)}
								required
								style={{ width: "100%" }}
							/>
						</div>

						<div
							style={{ display: "flex", flexDirection: "column", gap: "8px" }}
						>
							<label
								style={{ fontSize: "14px", color: "var(--text-secondary)" }}
							>
								Mật khẩu
							</label>
							<input
								type="password"
								placeholder="Nhập mật khẩu"
								onChange={(e) => setPassword(e.target.value)}
								required
								style={{ width: "100%" }}
							/>
						</div>

						<button type="submit" style={{ marginTop: "10px", width: "100%" }}>
							Đăng Nhập
						</button>
					</form>

					<p
						style={{
							textAlign: "center",
							marginTop: "24px",
							color: "var(--text-secondary)",
							fontSize: "14px",
						}}
					>
						Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
					</p>
				</div>
			</div>

			<Footer />
		</div>
	);
};

export default Login;
