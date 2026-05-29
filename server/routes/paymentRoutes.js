const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Thanh toán MoMo/VNPAY của ĐẠT hoạt động tốt!",
	});
});

module.exports = router;
