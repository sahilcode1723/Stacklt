// index.js
require("dotenv").config({ path: __dirname + "/.env" });
console.log("INDEX JWT_SECRET:", process.env.JWT_SECRET);
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./db/db");
const questionRoutes = require("./routes/questionRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const answerRoutes = require("./routes/answerRoutes");
app.use("/api/answers", answerRoutes);

app.use(cors());
app.use(express.json());
app.use("/api/questions", questionRoutes);

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});

app.get("/", (req, res) => {
  res.send("StackIt Backend is running 🚀");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
