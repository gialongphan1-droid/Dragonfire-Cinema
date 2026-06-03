const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtimeController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", showtimeController.getShowtimes);
router.get("/movie/:movieId", showtimeController.getShowtimesByMovie);
router.get("/date/:date", showtimeController.getShowtimesByDate);

// Admin routes
router.post("/create", verifyToken, isAdmin, showtimeController.createShowtime);
router.put("/:id", verifyToken, isAdmin, showtimeController.updateShowtime);
router.delete("/:id", verifyToken, isAdmin, showtimeController.deleteShowtime);

module.exports = router;