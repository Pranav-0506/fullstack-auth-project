const mysql = require("mysql2");

// Create connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Connect with proper error handling
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:");
    console.error(err.message);
    process.exit(1); // stop server if DB fails
  } else {
    console.log("✅ Database connected successfully");
  }
});

// Handle unexpected DB errors
db.on("error", (err) => {
  console.error("❌ DB runtime error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Reconnecting...");
  }
});

module.exports = db;