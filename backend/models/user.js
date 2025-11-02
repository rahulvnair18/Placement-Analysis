const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // We need this for hashing

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  role: { type: String, enum: ["Student", "HOD"], required: true },
  rollNo: { type: String, unique: true, sparse: true },
  regId: {
    type: String,
    required: true,
    unique: true,
  },
  batch: { type: String },
  password: { type: String, required: true },
});

// This is a special Mongoose function called a "pre-save hook".
// It runs automatically RIGHT BEFORE a user is saved.
userSchema.pre("save", async function (next) {
  // We only want to re-hash the password if it's a new user
  // or if the user is changing their password.
  if (!this.isModified("password")) {
    return next();
  }

  // This creates the "salt" (random text) to make the hash secure
  const salt = await bcrypt.genSalt(10);
  // This hashes the password and replaces the plain text one
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// This adds a helper function to our User model to easily compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
