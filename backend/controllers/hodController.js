const Classroom = require("../models/classroom");
const User = require("../models/user");
const ScheduledTest = require("../models/scheduledTest");
const crypto = require("crypto");

// Create classroom (already good)
const createClassroom = async (req, res) => {
  try {
    const { name, batch } = req.body;
    const hodId = req.user._id;
    if (!name || !batch) {
      return res
        .status(400)
        .json({ message: "Classroom name and batch are required." });
    }
    const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
    const joinCode = `C-${randomString}`;
    const newClassroom = new Classroom({ name, batch, hodId, joinCode });
    await newClassroom.save();
    res.status(201).json({
      message: "Classroom created successfully!",
      classroom: newClassroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    res.status(500).json({ message: "Server error creating classroom." });
  }
};
// Delete classroom
const deleteClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    await Classroom.deleteOne({ _id: classroomId });
    res.status(200).json({ message: "Classroom deleted successfully." });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    res.status(500).json({ message: "Server error deleting classroom." });
  }
};
// Get all classrooms for HOD
const getMyClassrooms = async (req, res) => {
  try {
    const hodId = req.user._id;
    const classrooms = await Classroom.find({ hodId }).sort({ createdAt: -1 });
    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    res.status(500).json({ message: "Server error fetching classrooms." });
  }
};

// Get classroom details
const getClassroomDetails = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    const classroom = await Classroom.findById(classroomId).populate(
      "students",
      "fullName rollNo"
    );

    if (!classroom || classroom.hodId.toString() !== hodId.toString()) {
      return res.status(404).json({
        message: "Classroom not found or you are not authorized to view it.",
      });
    }

    res.status(200).json(classroom);
  } catch (error) {
    console.error("Error fetching classroom details:", error);
    res
      .status(500)
      .json({ message: "Server error fetching classroom details." });
  }
};

// --- 🔥 NEW FUNCTION ---
// Regenerate classroom join code
const regenerateClassroomCode = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    // Ensure the classroom exists and belongs to this HOD
    const classroom = await Classroom.findById(classroomId);
    if (!classroom || classroom.hodId.toString() !== hodId.toString()) {
      return res.status(404).json({
        message: "Classroom not found or you are not authorized to modify it.",
      });
    }

    // Generate new code
    const randomString = crypto.randomBytes(3).toString("hex").toUpperCase();
    classroom.joinCode = `C-${randomString}`;
    await classroom.save();

    res.status(200).json({
      message: "Classroom join code regenerated successfully!",
      joinCode: classroom.joinCode,
    });
  } catch (error) {
    console.error("Error regenerating classroom code:", error);
    res
      .status(500)
      .json({ message: "Server error regenerating classroom code." });
  }
};
// --- NEW: Function to remove a student from a classroom ---
const removeStudentFromClassroom = async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;
    const hodId = req.user._id;

    // Security check: ensure the HOD owns this classroom
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // Use MongoDB's $pull operator to remove the studentId from the 'students' array
    // This is the most efficient way to remove an item from an array in the database.
    await Classroom.updateOne(
      { _id: classroomId },
      { $pull: { students: studentId } }
    );

    res.status(200).json({ message: "Student removed successfully." });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ message: "Server error removing student." });
  }
};
// --- NEW: Function to schedule a test for a classroom ---
const scheduleTest = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { title, startTime, endTime } = req.body;
    const hodId = req.user._id;

    // 1. Validate the input from the HOD's form.
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        message: "Test title, start time, and end time are required.",
      });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res
        .status(400)
        .json({ message: "End time must be after the start time." });
    }

    // 2. Security Check: Ensure the HOD owns this classroom before scheduling a test for it.
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // 3. Create the new "event ticket" document.
    const newScheduledTest = new ScheduledTest({
      title,
      startTime,
      endTime,
      classroomId,
      hodId,
    });

    await newScheduledTest.save();

    // 4. Send a success confirmation back.
    res
      .status(201)
      .json({ message: `Test "${title}" scheduled successfully.` });
  } catch (error) {
    console.error("Error scheduling test:", error);
    res.status(500).json({ message: "Server error scheduling test." });
  }
};
const getScheduledTestsForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const hodId = req.user._id;

    // Security Check: First, ensure the HOD owns the classroom they're asking about.
    const classroom = await Classroom.findOne({ _id: classroomId, hodId });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found or you are not authorized." });
    }

    // Find all tests in the 'scheduledtests' collection that match this classroomId
    const scheduledTests = await ScheduledTest.find({ classroomId }).sort({
      startTime: 1,
    }); // Sort by start time, showing upcoming tests first

    res.status(200).json(scheduledTests);
  } catch (error) {
    console.error("Error fetching scheduled tests:", error);
    res.status(500).json({ message: "Server error fetching scheduled tests." });
  }
};
module.exports = {
  createClassroom,
  getMyClassrooms,
  getClassroomDetails,
  regenerateClassroomCode,
  getScheduledTestsForClassroom,
  removeStudentFromClassroom,
  scheduleTest,
  deleteClassroom, // ✅ add this
};
