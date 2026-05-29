const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String },
		password: { type: String, required: true }, // Sau này sẽ dùng bcryptjs để mã hóa
		role: { type: String, enum: ["customer", "admin"], default: "customer" },
		points: { type: Number, default: 0 }, // Điểm tích lũy cá nhân
		membershipClass: { type: String, default: "Thanh vien Dong" }, // Hạng thành viên
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
