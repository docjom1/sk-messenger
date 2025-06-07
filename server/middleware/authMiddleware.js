const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token?
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "🚫 No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 this should give you `req.user.id`
    next();
  } catch (err) {
    console.error("❌ JWT verification error:", err.message);
    return res.status(401).json({ message: "❌ Invalid token" });
  }
};

module.exports = authMiddleware;
