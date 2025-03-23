// college-portal/server/routes/users.js
const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getAllUsers,
} = require("../controllers/usersController");
const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, getUserProfile);
router.get("/all", authMiddleware, getAllUsers); // Optional: Fetch all users

module.exports = router;
