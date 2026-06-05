const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtimeController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// === PUBLIC ROUTES ===
router.get("/", showtimeController.getAllShowtimes);
router.get("/movie/:movieId", showtimeController.getShowtimesByMovie);
router.get("/:id", showtimeController.getShowtimeById);
router.get("/:id/seats", showtimeController.getAvailableSeats);

// === ADMIN ROUTES ===
router.post("/", verifyToken, isAdmin, showtimeController.createShowtime);
router.put("/:id", verifyToken, isAdmin, showtimeController.updateShowtime);
router.delete("/:id", verifyToken, isAdmin, showtimeController.deleteShowtime);

// === ADMIN ROUTES - QUẢN LÝ KHÓA GHẾ ===
router.post("/lock-seats", verifyToken, isAdmin, showtimeController.lockSeats);
router.post(
	"/unlock-seats",
	verifyToken,
	isAdmin,
	showtimeController.unlockSeats,
);
router.get(
	"/:id/seats-status",
	verifyToken,
	isAdmin,
	showtimeController.getSeatsStatus,
);

module.exports = router;
