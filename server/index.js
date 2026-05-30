const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db"); // Import hàm kết nối mới

const app = express();

// Kết nối DB
connectDB();

app.use(express.json());
app.use(cors());

// ... (Giữ nguyên các đoạn khai báo routes như cũ) ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});