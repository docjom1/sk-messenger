const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const auth = require("../middleware/authMiddleware");

// Create group
router.post("/", auth, async (req, res) => {
  try {
    const group = new Group({
      name: req.body.name,
      admin: req.user.id,
      members: [req.user.id]  // auto add creator
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to group
router.post("/:groupId/add", auth, async (req, res) => {
  const { userId } = req.body;

  try {
    const group = await Group.findById(req.params.groupId);
    if (!group.admin.equals(req.user.id)) {
      return res.status(403).json({ error: "Only admin can add users" });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
