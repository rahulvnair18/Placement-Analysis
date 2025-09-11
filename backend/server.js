// server.js

// This must be the very first line of code
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// --- ROUTE DEFINITIONS ---
app.use("/api/auth", authRoutes);

// --- THIS IS THE CORRECTED LINE ---
// The base path for all question routes is now "/api/questions"
app.use("/api/questions", questionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
