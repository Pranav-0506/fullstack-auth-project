require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

/* =========================
   CLEAN CORS SETUP
========================= */

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROUTES
========================= */
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});