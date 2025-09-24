const express = require("express");
const router = express.Router();

// Import the controller functions and the security guard
const {
  getTestsWithStatus,
  joinClassroom,
  getMyClassrooms,
  getScheduledTestsForClassroom,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware"); // Using the general 'protect' guard

// --- Student Classroom Routes ---
// Every route in this file is protected to ensure the user is a logged-in student.

// Route for a student to join a new classroom using a code
// Full Path: POST /api/student/classrooms/join
router.post("/classrooms/join", protect, joinClassroom);

// Route for a student to get a list of all classrooms they are a member of
// Full Path: GET /api/student/classrooms/my-classrooms
router.get("/classrooms/my-classrooms", protect, getMyClassrooms);
router.get(
  "/classrooms/:classroomId/scheduled-tests",
  protect,
  getScheduledTestsForClassroom
);
router.get("/classroom-tests/:classroomId", protect, getTestsWithStatus);
module.exports = router;
