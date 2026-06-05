const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    // Thông tin thiết bị
    deviceName: {
        type: String,
        default: "Unknown Device"
    },
    deviceType: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "unknown"],
        default: "unknown"
    },
    browser: {
        type: String,
        default: "Unknown"
    },
    ipAddress: {
        type: String,
        default: ""
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Tự động xóa khi hết hạn
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Token", TokenSchema);