const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// Public routes
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovieById);

// Admin routes
router.post("/create", verifyToken, isAdmin, movieController.createMovie);
router.put("/:id", verifyToken, isAdmin, movieController.updateMovie);
router.delete("/:id", verifyToken, isAdmin, movieController.deleteMovie);

module.exports = router;