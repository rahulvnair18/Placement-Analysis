const mongoose = require("mongoose");

// This is the blueprint for each classroom created by an HOD.
const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // The batch this classroom is intended for (e.g., "2023-2025")
    batch: {
      type: String,
      required: true,
    },
    // A direct link to the HOD who owns this classroom.
    // 'ref: "User"' creates a connection to your User collection.
    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // An array that will store the unique IDs of students who join.
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // A unique, easy-to-share code for students to join.
    joinCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    // This automatically adds `createdAt` and `updatedAt` fields.
    timestamps: true,
  }
);

const Classroom = mongoose.model("Classroom", classroomSchema);

module.exports = Classroom;
