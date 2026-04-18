const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");

// Promisify DB
const query = util.promisify(db.query).bind(db);

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  console.log("🔥 SIGNUP HIT");
  console.log("BODY:", req.body);

  try {
    let { name, email, password } = req.body || {};

    // Normalize safely
    name = name?.trim();
    email = email?.toLowerCase().trim();

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Name, email, password are required",
      });
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "INVALID_EMAIL",
        message: "Email format is invalid",
      });
    }

    // Password length check
    if (password.length < 6 || password.length > 20) {
      return res.status(400).json({
        error: "PASSWORD_LENGTH",
        message: "Password must be 6–20 characters",
      });
    }

    // Strong password check
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,20}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "WEAK_PASSWORD",
        message:
          "Password must include uppercase, lowercase, number & special character",
      });
    }

    // Check existing user
    const existingUser = await query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: "USER_EXISTS",
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    console.log("✅ USER CREATED:", result.insertId);

    return res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });

  } catch (error) {
  console.log("🔥 SIGNUP ERROR FULL:", error);
  console.log("🔥 SQL MESSAGE:", error.sqlMessage);
  console.log("🔥 CODE:", error.code);

  return res.status(500).json({
    message: error.sqlMessage || error.message,
    code: error.code,
  });
}

  };

// ================= LOGIN =================
exports.login = async (req, res) => {
  console.log("🔥 LOGIN HIT");
  console.log("BODY:", req.body);

  try {
    let { email, password } = req.body || {};

    email = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Email and password are required",
      });
    }

    const users = await query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "No account found with this email",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "INVALID_PASSWORD",
        message: "Password is incorrect",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in .env");
      return res.status(500).json({
        error: "CONFIG_ERROR",
        message: "Server misconfiguration",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("🔥 LOGIN ERROR (FULL):", error);

    return res.status(500).json({
      error: error.code || "LOGIN_FAILED",
      message: error.sqlMessage || error.message || "Login failed",
    });
  }
};

// ================= PROFILE =================
exports.profile = async (req, res) => {
  try {
    const user = await query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    return res.json(user[0]);

  } catch (error) {
    console.error("PROFILE ERROR:", error);

    return res.status(500).json({
      error: error.code || "PROFILE_FAILED",
      message: error.sqlMessage || error.message,
    });
  }
};