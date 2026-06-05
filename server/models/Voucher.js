const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
	code: {
		type: String,
		required: [true, "Vui lòng nhập mã voucher"],
		unique: true,
		uppercase: true,
		trim: true,
	},
	name: {
		type: String,
		required: [true, "Vui lòng nhập tên voucher"],
	},
	description: {
		type: String,
		default: "",
	},
	discountType: {
		type: String,
		enum: ["percent", "fixed", "final_price"],
		required: true,
	},
	discountValue: {
		type: Number,
		required: true,
	},
	// 🔥 QUAN TRỌNG: Đối tượng áp dụng (vé hoặc ghế)
	applicableTo: {
		type: String,
		enum: ["ticket", "seat", "total"],
		default: "total",
		required: true,
	},
	// Loại vé được áp dụng (nếu applicableTo = "ticket")
	applicableTicketTypes: {
		type: [String],
		enum: ["adult", "student", "senior", "all"],
		default: ["all"],
	},
	// Loại ghế được áp dụng (nếu applicableTo = "seat")
	applicableSeatTypes: {
		type: [String],
		enum: ["normal", "vip", "couple", "all"],
		default: ["all"],
	},
	minOrderValue: {
		type: Number,
		default: 0,
	},
	maxDiscount: {
		type: Number,
		default: 0,
	},
	quantity: {
		type: Number,
		default: 0,
	},
	usedCount: {
		type: Number,
		default: 0,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ["active", "inactive", "expired"],
		default: "active",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Voucher", VoucherSchema);
