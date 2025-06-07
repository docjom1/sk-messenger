import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      alert("All fields except job title are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        name,
        username,
        email,
        jobTitle,
        password,
      });

      alert("✅ Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      console.error("❌ Registration Error:", err);
      alert(
        "Registration failed: " +
          (err.response?.data?.message || err.response?.data?.error || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>

      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br />

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <input
        placeholder="Job Title (Optional)"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
