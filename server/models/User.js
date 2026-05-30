const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		phone: { type: String },
		password: { type: String, required: true },
		role: { type: String, enum: ["customer", "admin"], default: "customer" },
		points: { type: Number, default: 0 }, // Điểm tích lũy cá nhân

		// Đã đổi thành rank để khớp hoàn toàn với file authRoutes.js
		rank: {
			type: String,
			enum: ["Bac", "Vang", "Kim cuong"],
			default: "Bac",
		},
	},
	{ timestamps: true }, // Tự động tạo trường createdAt và updatedAt (Rất tốt!)
);

module.exports = mongoose.model("User", UserSchema);
