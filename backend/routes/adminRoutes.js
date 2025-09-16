const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getAllHods,
  getAllClassrooms,
  addQuestionsToBank,
} = require("../controllers/adminController");
const { adminProtect } = require("../middleware/adminMiddleware");

// --- ADMIN DATA ROUTES ---
// Every route in this file is protected by the 'adminProtect' middleware.
// This ensures that only a user with an "Admin" role in their JWT can access these endpoints.

router.get("/students", adminProtect, getAllStudents);
router.get("/hods", adminProtect, getAllHods);
router.get("/classrooms", adminProtect, getAllClassrooms);
router.post("/questions/add", adminProtect, addQuestionsToBank);
module.exports = router;
