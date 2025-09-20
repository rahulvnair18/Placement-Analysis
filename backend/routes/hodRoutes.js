const express = require("express");
const router = express.Router();

// Import the controller functions and the security guard
const {
  createClassroom,
  getMyClassrooms,
  getClassroomDetails,
  regenerateClassroomCode, // 👈 new function
  removeStudentFromClassroom,
} = require("../controllers/hodController");
const { hodProtect } = require("../middleware/hodMiddleware");

// --- HOD Classroom Routes ---
// Every route in this file is protected by the 'hodProtect' middleware.

// Route to create a new classroom
// Full Path: POST /api/hod/classrooms/create
router.post("/classrooms/create", hodProtect, createClassroom);

// Route to get all of the HOD's own classrooms
// Full Path: GET /api/hod/classrooms/my-classrooms
router.get("/classrooms/my-classrooms", hodProtect, getMyClassrooms);

// Route to get details of a specific classroom
// Full Path: GET /api/hod/classrooms/:classroomId
router.get("/classrooms/:classroomId", hodProtect, getClassroomDetails);

// --- 🔥 NEW ROUTE ---
// Regenerate classroom join code
// Full Path: PUT /api/hod/classrooms/:classroomId/regenerate-code
router.put(
  "/classrooms/:classroomId/regenerate-code",
  hodProtect,
  regenerateClassroomCode
);

// Route to remove a student from a classroom's roster
// Full Path: PATCH /api/hod/classrooms/:classroomId/remove-student/:studentId
router.patch(
  "/classrooms/:classroomId/remove-student/:studentId",
  hodProtect,
  removeStudentFromClassroom
);

module.exports = router;
