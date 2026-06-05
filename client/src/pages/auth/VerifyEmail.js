import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState("verifying");
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (token) {
			verifyEmail();
		} else {
			setStatus("error");
			setMessage("Không tìm thấy token xác thực!");
		}
	}, [token]);

	const verifyEmail = async () => {
		try {
			console.log("Đang xác thực với token:", token);
			const response = await axios.post(
				"http://localhost:5000/api/auth/verify-email",
				{ token },
			);
			console.log("Response:", response.data);

			if (response.data.success) {
				setStatus("success");
				setMessage(response.data.message);
			} else {
				setStatus("error");
				setMessage(response.data.message);
			}
		} catch (error) {
			console.error("Lỗi:", error);
			setStatus("error");
			setMessage(error.response?.data?.message || "Xác thực email thất bại!");
		}
	};

	if (status === "verifying") {
		return (
			<div
				style={{
					maxWidth: "500px",
					margin: "100px auto",
					textAlign: "center",
					padding: "20px",
				}}
			>
				<h2>⏳ Đang xác thực...</h2>
				<p>Vui lòng đợi trong giây lát.</p>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div
				style={{
					maxWidth: "500px",
					margin: "100px auto",
					textAlign: "center",
					padding: "20px",
				}}
			>
				<h2 style={{ color: "#4caf50" }}>✅ {message}</h2>
				<p>Bạn có thể đăng nhập ngay bây giờ.</p>
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
					Đăng nhập ngay
				</Link>
			</div>
		);
	}

	return (
		<div
			style={{
				maxWidth: "500px",
				margin: "100px auto",
				textAlign: "center",
				padding: "20px",
			}}
		>
			<h2 style={{ color: "#e50914" }}>❌ {message}</h2>
			<p>Vui lòng kiểm tra lại hoặc đăng ký lại.</p>
			<Link
				to="/register"
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
				Đăng ký lại
			</Link>
		</div>
	);
};

export default VerifyEmail;
