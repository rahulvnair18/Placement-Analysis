const Classroom = require("../models/classroom");
const User = require("../models/user");
const ScheduledTest = require("../models/scheduledTest");
const ScheduledTestResult = require("../models/ScheduledTestResult");
// --- Function for a student to join a classroom ---
const joinClassroom = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const studentId = req.user._id; // Get student ID from the 'protect' middleware

    if (!joinCode) {
      return res.status(400).json({ message: "A join code is required." });
    }

    // 1. Find the classroom using the provided join code.
    const classroom = await Classroom.findOne({ joinCode });
    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Classroom not found. Please check the code." });
    }

    // 2. Get the full details of the student who is trying to join.
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    // 3. --- The Critical Security Check ---
    // Compare the batch assigned to the classroom with the student's own batch.
    if (classroom.batch !== student.batch) {
      return res.status(403).json({
        message: `This join code is not valid for your batch (${student.batch}).`,
      });
    }

    // 4. Check if the student is already a member of the classroom.
    if (classroom.students.includes(studentId)) {
      return res
        .status(409)
        .json({ message: "You are already a member of this classroom." });
    }

    // 5. If all checks pass, add the student to the classroom's roster.
    // We use $addToSet instead of $push to automatically prevent duplicates.
    await Classroom.updateOne(
      { _id: classroom._id },
      { $addToSet: { students: studentId } }
    );

    res
      .status(200)
      .json({ message: `Successfully joined classroom: ${classroom.name}` });
  } catch (error) {
    console.error("Error joining classroom:", error);
    res
      .status(500)
      .json({ message: "Server error while trying to join classroom." });
  }
};

// --- Function to get all classrooms a student has joined ---
const getMyClassrooms = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Find all classrooms where the 'students' array contains the logged-in student's ID.
    // We also populate the HOD's name for a better UI experience.
    const classrooms = await Classroom.find({ students: studentId })
      .populate("hodId", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(classrooms);
  } catch (error) {
    console.error("Error fetching student's classrooms:", error);
    res.status(500).json({ message: "Server error fetching your classrooms." });
  }
};
// This function now has the 'ScheduledTest' ingredient it needs.
const getScheduledTestsForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user._id;

    // Security Check
    const classroom = await Classroom.findOne({
      _id: classroomId,
      students: studentId,
    });
    if (!classroom) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom." });
    }

    // Now this line will work because ScheduledTest is defined.
    const scheduledTests = await ScheduledTest.find({ classroomId }).sort({
      startTime: 1,
    });

    res.status(200).json(scheduledTests);
  } catch (error) {
    console.error("Error fetching scheduled tests for student:", error);
    res.status(500).json({ message: "Server error fetching scheduled tests." });
  }
};
const getTestsWithStatus = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const studentId = req.user._id;

    // Security check
    const classroom = await Classroom.findOne({
      _id: classroomId,
      students: studentId,
    });
    if (!classroom) {
      return res
        .status(403)
        .json({ message: "You are not a member of this classroom." });
    }

    // 2. Get the list of scheduled tests for the classroom
    const scheduledTests = await ScheduledTest.find({ classroomId }).lean();

    // 3. Get all of the student's results for THIS SET of tests
    const testIds = scheduledTests.map((t) => t._id);
    const results = await ScheduledTestResult.find({
      studentId: studentId,
      scheduledTestId: { $in: testIds },
    });

    const resultMap = new Map();
    results.forEach((r) =>
      resultMap.set(r.scheduledTestId.toString(), r._id.toString())
    );

    const testsWithStatus = scheduledTests.map((test) => {
      const now = new Date();
      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);
      let status = "upcoming";
      let resultId = null; // Default resultId is null

      if (resultMap.has(test._id.toString())) {
        status = "attempted";
        resultId = resultMap.get(test._id.toString()); // <-- Add the resultId
      } else if (now >= startTime && now <= endTime) {
        status = "live";
      } else if (now > endTime) {
        status = "ended";
      }

      return {
        ...test,
        status: status,
        resultId: resultId, // <-- Include the resultId in the response
      };
    });

    res.status(200).json(testsWithStatus);
  } catch (error) {
    console.error("Error fetching tests with status:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getTestsWithStatus,
  joinClassroom,
  getMyClassrooms,
  getScheduledTestsForClassroom,
};
