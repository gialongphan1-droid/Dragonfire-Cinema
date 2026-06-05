const mongoose = require("mongoose");

const VerificationTokenSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		token: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: ["verify", "reset", "email_change"], // ✅ THÊM "email_change"
			required: true,
		},
		newEmail: {
			// ✅ THÊM field này cho email_change
			type: String,
			default: null,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{ timestamps: true },
);

VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("VerificationToken", VerificationTokenSchema);
