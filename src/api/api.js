const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // ✅ correct
  headers: {
    "Content-Type": "application/json"
  }
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
