import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmailChange = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState("verifying");
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (token) {
			verifyEmailChange();
		} else {
			setStatus("error");
			setMessage("Không tìm thấy token xác thực!");
		}
	}, [token]);

	const verifyEmailChange = async () => {
		try {
			const response = await axios.post(
				"http://localhost:5000/api/auth/verify-email-change",
				{ token },
			);
			if (response.data.success) {
				setStatus("success");
				setMessage(response.data.message);
				// Xóa token cũ trong localStorage để buộc đăng nhập lại
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
			} else {
				setStatus("error");
				setMessage(response.data.message);
			}
		} catch (error) {
			setStatus("error");
			setMessage(error.response?.data?.message || "Xác thực thất bại!");
		}
	};

	return (
		<div
			style={{
				maxWidth: "500px",
				margin: "100px auto",
				textAlign: "center",
				padding: "20px",
			}}
		>
			{status === "verifying" && <h2>⏳ Đang xác thực...</h2>}
			{status === "success" && (
				<div>
					<h2 style={{ color: "#4caf50" }}>✅ {message}</h2>
					<p>Vui lòng đăng nhập lại với email mới.</p>
					<Link
						to="/login"
						style={{
							display: "inline-block",
							marginTop: "20px",
							padding: "10px 20px",
							background: "#e50914",
							color: "white",
							textDecoration: "none",
							borderRadius: "8px",
						}}
					>
						Đăng nhập lại
					</Link>
				</div>
			)}
			{status === "error" && (
				<div>
					<h2 style={{ color: "#e50914" }}>❌ {message}</h2>
					<Link
						to="/profile"
						style={{
							display: "inline-block",
							marginTop: "20px",
							padding: "10px 20px",
							background: "#e50914",
							color: "white",
							textDecoration: "none",
							borderRadius: "8px",
						}}
					>
						Quay lại trang cá nhân
					</Link>
				</div>
			)}
		</div>
	);
};

export default VerifyEmailChange;
