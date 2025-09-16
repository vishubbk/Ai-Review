require("dotenv").config(); // Load environment variables first
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectdb = require("./db/db");
const aiRoute = require("./routes/ai.route.js");
const path = require("path");



const app = express();
const port = process.env.PORT || 4000;

// 🔹 Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔹 CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔹 Connect to Database
connectdb()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// 🔹 Basic Testing Route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

app.use("/get-service",aiRoute)



// 🔹 Start Server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
