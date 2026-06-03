const express = require("express");
const router = express.Router();

const showtimeController = require("../controllers/showtimeController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware"); // ← THÊM DÒNG NÀY

router.get("/test", (req, res) => {
	res.json({
		message: "Đường truyền API Lịch chiếu & Phòng của HOÀNG hoạt động tốt!",
	});
});

// === PUBLIC ROUTES (Ai cũng xem được) ===
router.get("/", showtimeController.getAllShowtimes);
router.get("/movie/:movieId", showtimeController.getShowtimesByMovie); // ← THÊM DÒNG NÀY
router.get("/:id", showtimeController.getShowtimeById);
router.get("/:id/seats", showtimeController.getAvailableSeats); // ← THÊM DÒNG NÀY

// === ADMIN ROUTES (Chỉ admin mới được thêm/sửa/xóa) ===
router.post("/", verifyToken, isAdmin, showtimeController.createShowtime); // ← THÊM middleware
router.put("/:id", verifyToken, isAdmin, showtimeController.updateShowtime); // ← THÊM middleware
router.delete("/:id", verifyToken, isAdmin, showtimeController.deleteShowtime); // ← THÊM middleware

module.exports = router;