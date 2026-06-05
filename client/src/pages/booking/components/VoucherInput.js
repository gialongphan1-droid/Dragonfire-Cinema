import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const VoucherInput = ({ onVoucherApplied, totalAmount, token }) => {
	const [voucherCode, setVoucherCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [appliedVoucher, setAppliedVoucher] = useState(null);

	const handleApplyVoucher = async () => {
		if (!voucherCode.trim()) {
			setError("Vui lòng nhập mã voucher!");
			return;
		}

		if (!token) {
			setError("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const requestData = {
				code: voucherCode,
				orderValue: totalAmount,
			};

			const response = await axios.post(
				`${API_URL}/vouchers/validate`,
				requestData,
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (response.data.success) {
				const voucherData = {
					code: response.data.voucher.code,
					discountAmount: response.data.discountAmount,
					finalAmount: response.data.finalAmount,
				};
				setAppliedVoucher(voucherData);
				onVoucherApplied(voucherData);
				setVoucherCode("");
			}
		} catch (error) {
			setError(error.response?.data?.message || "Mã voucher không hợp lệ!");
			onVoucherApplied(null);
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveVoucher = () => {
		setAppliedVoucher(null);
		onVoucherApplied(null);
		setVoucherCode("");
		setError("");
	};

	if (totalAmount === 0) {
		return null;
	}

	return (
		<div
			style={{
				marginTop: 15,
				padding: 15,
				background: "#f9f9f9",
				borderRadius: 12,
				border: "1px solid #e0e0e0",
			}}
		>
			<div style={{ fontWeight: "bold", marginBottom: 10 }}>🎫 MÃ GIẢM GIÁ</div>

			{appliedVoucher ? (
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "12px",
						background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
						borderRadius: "8px",
						border: "1px solid #4caf50",
					}}
				>
					<div>
						<span
							style={{
								fontWeight: "bold",
								color: "#2e7d32",
								fontSize: "14px",
							}}
						>
							🎫 Mã:{" "}
							<span style={{ fontSize: "16px" }}>{appliedVoucher.code}</span>
						</span>
						<span
							style={{
								display: "block",
								fontSize: "12px",
								color: "#555",
								marginTop: "4px",
							}}
						>
							Giảm {appliedVoucher.discountAmount.toLocaleString()}đ
						</span>
					</div>
					<button
						onClick={handleRemoveVoucher}
						style={{
							background: "none",
							border: "none",
							fontSize: "20px",
							cursor: "pointer",
							color: "#666",
							padding: "4px 8px",
						}}
					>
						✕ Hủy
					</button>
				</div>
			) : (
				<div style={{ display: "flex", gap: "10px" }}>
					<input
						type="text"
						placeholder="Nhập mã giảm giá (VD: CHUATAYDAU)"
						value={voucherCode}
						onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
						onKeyPress={(e) => e.key === "Enter" && handleApplyVoucher()}
						style={{
							flex: 1,
							padding: "12px",
							border: "1px solid #ddd",
							borderRadius: "8px",
							fontSize: "14px",
							outline: "none",
						}}
					/>
					<button
						onClick={handleApplyVoucher}
						disabled={loading}
						style={{
							padding: "12px 24px",
							background: "#e50914",
							color: "white",
							border: "none",
							borderRadius: "8px",
							cursor: loading ? "not-allowed" : "pointer",
							fontWeight: "bold",
							fontSize: "14px",
						}}
					>
						{loading ? "Đang áp dụng..." : "Áp dụng"}
					</button>
				</div>
			)}
			
			{error && (
				<div
					style={{
						color: "#e50914",
						marginTop: 10,
						fontSize: 12,
						padding: 8,
						background: "#ffebee",
						borderRadius: 6,
					}}
				>
					⚠️ {error}
				</div>
			)}
		</div>
	);
};

export default VoucherInput;