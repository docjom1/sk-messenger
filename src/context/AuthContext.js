import React, { createContext, useContext, useState, useEffect } from "react";
import { initSocket } from "../utils/socket"; // ✅ IMPORT SOCKET INIT

// 1. Create Context
const AuthContext = createContext();

// 2. Custom hook
export const useAuth = () => useContext(AuthContext);

// 3. Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ Load from localStorage on page load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // ✅ INIT SOCKET after reload if logged in
      initSocket(storedToken);
    }
  }, []);

  // ✅ Save token + user on login
  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ INIT SOCKET after login
    initSocket(token);
  };

  // ✅ Clear on logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
