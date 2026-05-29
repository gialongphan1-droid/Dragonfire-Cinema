const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Auth & Điểm thưởng của LONG PHAN hoạt động tốt!",
	});
});

module.exports = router;
