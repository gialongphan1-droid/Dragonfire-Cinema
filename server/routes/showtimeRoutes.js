const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtimeController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// === PUBLIC ROUTES (Ai cũng xem được) ===
router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Lịch chiếu & Phòng của HOÀNG hoạt động tốt!",
	});
});

router.get("/", showtimeController.getAllShowtimes);
router.get("/movie/:movieId", showtimeController.getShowtimesByMovie);
router.get("/:id", showtimeController.getShowtimeById);
router.get("/:id/seats", showtimeController.getAvailableSeats);

// === ADMIN ROUTES (Chỉ admin mới được thêm/sửa/xóa) ===
router.post("/", verifyToken, isAdmin, showtimeController.createShowtime);
router.put("/:id", verifyToken, isAdmin, showtimeController.updateShowtime);
router.delete("/:id", verifyToken, isAdmin, showtimeController.deleteShowtime);

module.exports = router;