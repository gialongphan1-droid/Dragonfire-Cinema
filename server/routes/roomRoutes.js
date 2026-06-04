const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Public routes (ai cũng xem được)
router.get("/", roomController.getAllRooms);
router.get("/types", roomController.getRoomTypes);
router.get("/:id", roomController.getRoomById);

// Admin routes (chỉ admin)
router.post("/", verifyToken, isAdmin, roomController.createRoom);
router.put("/:id", verifyToken, isAdmin, roomController.updateRoom);
router.delete("/:id", verifyToken, isAdmin, roomController.deleteRoom);

module.exports = router;