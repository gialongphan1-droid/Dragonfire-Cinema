const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Vui lòng nhập họ tên"],
		trim: true,
		maxlength: [50, "Tên không được quá 50 ký tự"],
	},
	email: {
		type: String,
		required: [true, "Vui lòng nhập email"],
		unique: true,
		lowercase: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Vui lòng nhập email hợp lệ",
		],
	},
	password: {
		type: String,
		required: [true, "Vui lòng nhập mật khẩu"],
		minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
		select: false,
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	points: {
		type: Number,
		default: 0,
	},
	rank: {
		type: String,
		enum: ["MEMBER", "SILVER", "GOLD", "DIAMOND"],
		default: "MEMBER",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// So sánh mật khẩu
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
