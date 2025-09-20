const Classroom = require("../models/classroom");
const User = require("../models/user");
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
module.exports = {
  createClassroom,
  getMyClassrooms,
  getClassroomDetails,
  regenerateClassroomCode, // 👈 export new function
  removeStudentFromClassroom,
};
