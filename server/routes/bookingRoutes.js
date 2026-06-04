const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/seats/:showtimeId", bookingController.getAvailableSeats);
router.post("/create", verifyToken, bookingController.createBooking);
router.get("/my-bookings", verifyToken, bookingController.getMyBookings);
router.delete("/cancel-booking/:bookingId", verifyToken, bookingController.cancelBooking);

module.exports = router;
