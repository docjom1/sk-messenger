const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Message = require("../models/Message");

// 📨 Send a message to a specific user
router.post("/:receiverId", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.receiverId;
    const senderId = req.user._id;

    if (!content || !receiverId) {
      return res.status(400).json({ message: "Missing content or receiver." });
    }

   const message = new Message({
  sender: req.user.id,   // <- this might be undefined!
  receiver: receiverId,
  content,
  timestamp: new Date(),
});

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error("❌ Failed to save message:", err.message);
    res.status(500).json({ error: "Message could not be saved." });
  }
});

// 💬 Get conversation between current user and another
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err.message);
    res.status(500).json({ error: "Messages could not be retrieved." });
  }
});

module.exports = router;
