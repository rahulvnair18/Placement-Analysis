const express = require("express");
const router = express.Router();

const {
  getStudentResultForHOD,
  getTestAnalysisForHOD,
  getHodQuestionStats,
  addQuestionsToHodBank,
  createClassroom,
  getMyClassrooms,
  getClassroomDetails,
  regenerateClassroomCode,
  removeStudentFromClassroom,
  scheduleTest,
  getScheduledTestsForClassroom,
  deleteClassroom,
} = require("../controllers/hodController"); // <-- Corrected import list
const { hodProtect } = require("../middleware/hodMiddleware");

// Routes for HOD's private question bank
router.post("/questions/add", hodProtect, addQuestionsToHodBank);
router.get("/questions/stats", hodProtect, getHodQuestionStats);

// Routes for managing classrooms
router.post("/classrooms/create", hodProtect, createClassroom);
router.get("/classrooms/my-classrooms", hodProtect, getMyClassrooms);
router.get("/classrooms/:classroomId", hodProtect, getClassroomDetails);
router.put(
  "/classrooms/:classroomId/regenerate-code",
  hodProtect,
  regenerateClassroomCode
);
router.patch(
  "/classrooms/:classroomId/remove-student/:studentId",
  hodProtect,
  removeStudentFromClassroom
);
router.post("/classrooms/:classroomId/schedule-test", hodProtect, scheduleTest);
router.get(
  "/classrooms/:classroomId/scheduled-tests",
  hodProtect,
  getScheduledTestsForClassroom
);
router.delete("/classrooms/:classroomId", hodProtect, deleteClassroom);
router.get(
  "/test-analysis/:scheduledTestId",
  hodProtect,
  getTestAnalysisForHOD
);
router.get(
  "/student-result/:scheduledTestId/:studentId",
  hodProtect,
  getStudentResultForHOD
);

// --- THIS ROUTE WAS REMOVED BECAUSE IT DOES NOT BELONG HERE ---
// router.get(
//   "/scheduled-result/:resultId",
//   hodProtect,
//   getScheduledResultDetails
// );

module.exports = router;
