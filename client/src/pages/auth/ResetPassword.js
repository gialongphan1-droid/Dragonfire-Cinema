import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const navigate = useNavigate();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			setError("Không tìm thấy token đặt lại mật khẩu!");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			setError("Mật khẩu xác nhận không khớp!");
			return;
		}

		if (password.length < 6) {
			setError("Mật khẩu phải có ít nhất 6 ký tự!");
			return;
		}

		setLoading(true);
		setError("");
		setMessage("");

		try {
			const response = await axios.post(
				"http://localhost:5000/api/auth/reset-password",
				{
					token,
					password,
				},
			);

			if (response.data.success) {
				setMessage(response.data.message);
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			} else {
				setError(response.data.message);
			}
		} catch (err) {
			setError(err.response?.data?.message || "Có lỗi xảy ra!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="reset-password-container">
			<main className="reset-password-main">
				<div className="reset-password-card">
					<h2 className="reset-password-title">Đặt lại mật khẩu</h2>

					{message && <div className="success-message">{message}</div>}

					{error && <div className="error-message">{error}</div>}

					<form className="reset-password-form" onSubmit={handleSubmit}>
						<div className="form-group">
							<label>Mật khẩu mới</label>
							<input
								type="password"
								className="form-control"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
								required
							/>
						</div>

						<div className="form-group">
							<label>Xác nhận mật khẩu</label>
							<input
								type="password"
								className="form-control"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Nhập lại mật khẩu mới"
								required
							/>
						</div>

						<button
							type="submit"
							className="reset-password-btn"
							disabled={loading}
						>
							{loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
						</button>
					</form>

					<p className="reset-password-footer">
						<a href="/login">← Quay lại đăng nhập</a>
					</p>
				</div>
			</main>
		</div>
	);
};

export default ResetPassword;
