const express = require("express");
const router = express.Router();

// Tạo một API chạy thử nghiệm cho từng module
router.get("/test", (req, res) => {
	res.json({ message: "Đường truyền API hoạt động bình thường!" });
});

module.exports = router;
