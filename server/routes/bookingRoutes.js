const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Đặt vé & Giữ ghế của HIẾU hoạt động tốt!",
	});
});

module.exports = router;
