const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🎉 Kết nối thành công tới MongoDB Atlas!");
    } catch (err) {
        console.error("❌ Lỗi kết nối Database:", err.message);
        process.exit(1); // Dừng app nếu không kết nối được DB
    }
};

module.exports = connectDB;