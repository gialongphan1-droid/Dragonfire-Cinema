const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/seats/:showtimeId", verifyToken, bookingController.getBookedSeats);
router.post("/create", verifyToken, bookingController.createBooking);
router.put("/confirm/:bookingId", verifyToken, bookingController.confirmPayment);
router.get("/my-bookings", verifyToken, bookingController.getUserBookings);

module.exports = router;