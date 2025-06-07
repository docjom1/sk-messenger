const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// ✅ Route: GET /api/users
// Fetch all users except the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err.message);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// 🔍 Route: GET /api/users/search?q=keyword
// Search users by name or username
router.get("/search", auth, async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } }
      ],
      _id: { $ne: req.user.id } // Exclude the current user
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Search error:", err.message);
    res.status(500).json({ error: "Search failed." });
  }
});

module.exports = router;
