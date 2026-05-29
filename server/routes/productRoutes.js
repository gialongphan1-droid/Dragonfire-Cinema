const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Quản lý Combo Bắp nước của KỶ hoạt động tốt!",
	});
});

module.exports = router;
