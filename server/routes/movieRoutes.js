const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Hệ thống Phim của LÊ LONG hoạt động tốt!",
	});
});

module.exports = router;
