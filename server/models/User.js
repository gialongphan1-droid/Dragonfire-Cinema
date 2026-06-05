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
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// ✅ DÙNG FUNCTION THƯỜNG (KHÔNG ASYNC) + CALLBACK
// UserSchema.pre("save", function(next) {
//     const user = this;
    
//     if (!user.isModified("password")) {
//         return next();
//     }
    
//     bcrypt.genSalt(10, (err, salt) => {
//         if (err) return next(err);
        
//         bcrypt.hash(user.password, salt, (err, hash) => {
//             if (err) return next(err);
//             user.password = hash;
//             next();
//         });
//     });
// });

// So sánh mật khẩu - dùng Promise
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);