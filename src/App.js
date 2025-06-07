// src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";

import { AuthProvider, useAuth } from "./context/AuthContext";

// ✅ Optional: A simple loading screen while auth state loads
function LoadingScreen() {
  return (
    <div style={{ textAlign: "center", padding: "2rem", fontSize: "1.2rem" }}>
      Checking authentication...
    </div>
  );
}

// ✅ Route protection wrapper
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" replace />;
}

// ✅ Guest-only wrapper
function PublicRoute({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/chat" replace />;
}

// ✅ All routes handled here
function AppRoutes() {
  const { token } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Simulate token load (can be replaced with real auth loading logic)
    setReady(true);
  }, [token]);

  if (!ready) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        }
      />
      {/* 🔁 Fallback: Catch any unknown routes */}
      <Route path="*" element={<Navigate to={token ? "/chat" : "/"} replace />} />
    </Routes>
  );
}

// ✅ App component wraps routes with context and router
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
