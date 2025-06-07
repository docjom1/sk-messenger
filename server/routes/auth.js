const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// ✅ POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, jobTitle } = req.body;

    // 🔍 Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }

    // ❌ Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 💾 Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      jobTitle,
    });

    await newUser.save();

    // ✅ Respond with user details (no password)
    res.status(201).json({
      message: "✅ User registered successfully.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        jobTitle: newUser.jobTitle,
      },
    });
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).json({ error: "Something went wrong during registration." });
  }
});

// ✅ POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 🔍 Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 🪪 Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🚫 Don't expose password
    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      token,
      user: userData,
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: "Something went wrong during login." });
  }
});

// ✅ GET /api/auth/
router.get("/", (req, res) => {
  res.send("✅ Auth route is working!");
});

module.exports = router;
