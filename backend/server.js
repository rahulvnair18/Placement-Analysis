// server.js

// This must be the very first line of code
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// --- All route imports are now grouped at the top for clarity ---
const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const testRoutes = require("./routes/testRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resultRoutes = require("./routes/resultRoutes");
const hodRoutes = require("./routes/hodRoutes");
// --- 1. Import the new student routes file ---
const studentRoutes = require("./routes/studentRoutes");

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTE DEFINITIONS ---
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes); // For Admin question management
app.use("/api/tests", testRoutes); // For Students to start tests
app.use("/api/admin", adminRoutes); // For Admin data viewing
app.use("/api/results", resultRoutes); // For Student results
app.use("/api/hod", hodRoutes); // For HOD classroom management

// --- 2. Add the new route to activate the student endpoints ---
app.use("/api/student", studentRoutes); // For Student classroom actions

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
