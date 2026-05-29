const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	showtimeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Showtime",
		required: true,
	},
	seats: [{ type: String, required: true }], // Ví dụ: ["A1", "A2"] -> Do HIẾU xử lý lúc chọn
	foods: [
		{
			foodId: { type: mongoose.Schema.Types.ObjectId, ref: "FoodCombo" },
			quantity: Number,
		},
	], // Combo bắp nước khách mua kèm -> Do KỶ cung cấp, HIẾU lưu vào đơn

	// ----- PHẦN THÔNG TIN THANH TOÁN (Do ĐẠT xử lý) -----
	totalAmount: { type: Number, required: true }, // Tổng tiền vé + bắp nước
	status: {
		type: String,
		enum: ["pending", "completed", "failed", "cancelled"],
		default: "pending",
	}, // Ban đầu Hiếu tạo đơn sẽ là "pending", Đạt thanh toán xong sẽ chuyển thành "completed"
	paymentMethod: { type: String }, // "momo", "vnpay", "cash"
	paymentCode: { type: String }, // Mã giao dịch từ ví điện tử trả về
	ticketCode: { type: String }, // Chuỗi mã code bảo mật dùng để quét QR lúc ra rạp
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
