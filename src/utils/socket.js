// src/utils/socket.js
import { io } from "socket.io-client";

let socket = null;

// Initialize socket only if token is available
export const initSocket = (token) => {
  if (!token) return;

  // Avoid re-initializing if already connected
  if (socket) return;

  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 10000,
    transports: ["websocket"], // Force WebSocket transport
  });

  // Connected
  socket.on("connect", () => {
    console.log("🟢 Connected to socket server:", socket.id);
  });

  // Disconnected
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected from socket server");
  });

  // Error handling
  socket.on("connect_error", (err) => {
    console.error("❌ Socket connect error:", err.message);
  });
};

// Get socket instance
export const getSocket = () => socket;
