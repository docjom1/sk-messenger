const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models
const Message = require("./models/Message");
const Group = require("./models/Group");

// App setup
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/groups", require("./routes/groups"));


app.get("/", (req, res) => res.send("Server is live 🚀"));

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = new Map();

// Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.error("⚠️ No token provided on socket connection");
    return next(new Error("Authentication error: No token"));
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    return next(new Error("Authentication error"));
  }
});

// Socket Connection
io.on("connection", (socket) => {
  const userId = socket.user.id;
  console.log(`🔌 User connected: ${userId}`);
  onlineUsers.set(userId, socket.id);

  // Emit online users to all clients
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // Typing indicator
  socket.on("typing", ({ sender, receiver }) => {
    const targetSocket = onlineUsers.get(receiver);
    if (targetSocket) {
      io.to(targetSocket).emit("typing", { sender });
    }
  });

  // Send Message
  socket.on("sendMessage", async (data) => {
    try {
      const { content, receiverId, isGroup, groupId } = data;

      const newMessage = new Message({
        sender: userId,
        content,
        timestamp: new Date(),
        ...(isGroup ? { group: groupId } : { receiver: receiverId }),
      });

      await newMessage.save();

      if (isGroup) {
        const group = await Group.findById(groupId).populate("members");
        group.members.forEach(member => {
          const memberId = member._id.toString();
          if (memberId !== userId) {
            const targetSocket = onlineUsers.get(memberId);
            if (targetSocket) {
              io.to(targetSocket).emit("receiveMessage", newMessage);
            }
          }
        });
      } else {
        const targetSocket = onlineUsers.get(receiverId);
        if (targetSocket) {
          io.to(targetSocket).emit("receiveMessage", newMessage);
        }
      }
    } catch (err) {
      console.error("💾 Message error:", err.message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    console.log(`❌ User disconnected: ${userId}`);
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack || err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
