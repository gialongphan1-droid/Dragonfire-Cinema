const mongoose = require("mongoose");

// URI dạng SRV (có thể bị lỗi DNS)
const SRV_URI = process.env.MONGO_URI;

// URI dạng IP (dự phòng khi SRV lỗi)
const IP_URI =
	"mongodb://gialongphan1_db_user:n4vpfrNzEUJHykK4@ac-dpcsykx-shard-00-00.8urdx7n.mongodb.net:27017,ac-dpcsykx-shard-00-01.8urdx7n.mongodb.net:27017,ac-dpcsykx-shard-00-02.8urdx7n.mongodb.net:27017/DragonfireCinema?ssl=true&replicaSet=atlas-cvmv3k-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectDB = async (retryCount = 0) => {
	try {
		// Thử kết nối với URI từ .env trước
		console.log("🔄 Đang kết nối MongoDB Atlas...");
		const conn = await mongoose.connect(SRV_URI);
		console.log(`✅ Kết nối MongoDB Atlas thành công!`);
		console.log(`📦 Database: ${conn.connection.name}`);
	} catch (error) {
		console.log(`⚠️ Lỗi kết nối với SRV URI: ${error.message}`);
		console.log("🔄 Đang thử kết nối với IP URI dự phòng...");

		try {
			const conn = await mongoose.connect(IP_URI);
			console.log(`✅ Kết nối MongoDB Atlas thành công! (dùng IP dự phòng)`);
			console.log(`📦 Database: ${conn.connection.name}`);
		} catch (ipError) {
			console.error(`❌ Lỗi kết nối MongoDB: ${ipError.message}`);
			if (retryCount < 3) {
				console.log(`🔄 Thử lại lần ${retryCount + 2} sau 5 giây...`);
				setTimeout(() => connectDB(retryCount + 1), 5000);
			} else {
				console.error("❌ Không thể kết nối MongoDB sau nhiều lần thử!");
			}
		}
	}
};

module.exports = connectDB;
