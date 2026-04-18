const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  profile,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
router.post("/signup", signup);
router.post("/login", login);

// ================= PROTECTED ROUTES =================
router.get("/profile", verifyToken, profile);

// 🔐 Token verification route (frontend auth check)
router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Token valid ✅",
    user: req.user,
  });
});

module.exports = router;