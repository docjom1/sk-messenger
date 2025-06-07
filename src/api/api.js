import axios from "axios";

// ✅ Create a custom Axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update for production later
  headers: {
    "Content-Type": "application/json", // Always send JSON
  },
});

// ✅ Automatically attach token to every request if it exists
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error.message);
    return Promise.reject(error);
  }
);

// ✅ (Optional but smart): Auto logout if token is invalid/expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Unauthorized or expired token");
      localStorage.removeItem("token");
      // Redirect to login (optional):
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default API;
