import React, { useEffect, useRef, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { initSocket, getSocket } from "../utils/socket";

export default function Chat() {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef(null);

  // ✅ INIT SOCKET ONCE
  useEffect(() => {
    if (!token) return;

    initSocket(token);
    const socket = getSocket();

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("❌ Failed to load users:", err.message);
      }
    };

    fetchUsers(); // Always try to fetch users on mount

    socket.on("connect", fetchUsers);

    socket.on("receiveMessage", (msg) => {
      if (
        chatUser &&
        (msg.sender === chatUser._id || msg.receiver === chatUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ sender }) => {
      if (chatUser && sender === chatUser._id) {
        setTypingUser(chatUser.name);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => socket.disconnect();
  }, [token, chatUser]);

  // ✅ Load messages when a user is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatUser) return;
      try {
        const res = await API.get(`/messages/${chatUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load messages:", err.message);
      }
    };
    loadMessages();
  }, [chatUser]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!chatUser?._id) return;

    const msg = {
      sender: user._id,
      receiver: chatUser._id,
      content: message,
      timestamp: new Date(),
    };

    try {
      getSocket().emit("sendMessage", msg);
      await API.post(`/messages/${chatUser._id}`, msg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    } catch (err) {
      console.error("❌ Send failed:", err.message);
    }
  };

  // ✅ Typing
  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (chatUser?._id) {
      getSocket().emit("typing", {
        sender: user._id,
        receiver: chatUser._id,
      });
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ddd",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Users</h3>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => setChatUser(u)}
            style={{
              padding: "8px",
              marginBottom: "5px",
              cursor: "pointer",
              background: chatUser?._id === u._id ? "#f0f0f0" : "transparent",
            }}
          >
            {u.name}
          </div>
        ))}
        <button onClick={logout} style={{ marginTop: "20px" }}>
          Logout
        </button>
      </div>

      {/* CHAT WINDOW */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "10px",
        }}
      >
        <h4>Chatting with: {chatUser?.name || "No one selected"}</h4>

        <div
          style={{
            flex: 1,
            border: "1px solid #ccc",
            overflowY: "auto",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {typingUser && (
            <p style={{ fontStyle: "italic", marginBottom: "5px" }}>
              {typingUser} is typing...
            </p>
          )}

          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.sender === user._id ? "right" : "left",
                  margin: "5px 0",
                }}
              >
                <strong>
                  {msg.sender === user._id ? "You" : chatUser?.name || ""}
                </strong>
                <p>{msg.content}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {chatUser && (
          <div style={{ display: "flex" }}>
            <input
              value={message}
              onChange={handleTyping}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ flex: 1, padding: "8px" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
