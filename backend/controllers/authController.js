const User = require("../models/user");
const jwt = require("jsonwebtoken"); // We need this for creating tokens

// A helper function to create our "ID card" (the JWT)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d", // The ID card is valid for 1 day
  });
};

// Your registerUser function is mostly the same, but now it will benefit
// from the automatic password hashing in the user model.
const registerUser = async (req, res) => {
  try {
    const { fullName, role, rollNo, regId, batch, password, confirmPassword } =
      req.body;

    if (!fullName || !role || !regId || !password || !confirmPassword) {
      return res.status(400).json({ message: "Required fields are missing" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const existingUser = await User.findOne({ regId });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this Registration ID already exists" });
    }

    // We create the user here. The 'pre("save")' function in user.js will
    // automatically handle hashing the password before it hits the database.
    const newUser = new User({
      fullName,
      role,
      rollNo: role === "Student" ? rollNo : undefined,
      regId,
      batch: role === "Student" ? batch : undefined,
      password,
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// The loginUser function has the biggest changes
const loginUser = async (req, res) => {
  const { regId, password } = req.body;

  try {
    // --- NEW ADMIN LOGIN LOGIC ---
    // This block runs BEFORE we check the database.
    // It checks if the login attempt matches the special admin credentials from the .env file.
    if (
      regId === process.env.ADMIN_ID &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // If it's the admin, we create a special JWT for them.
      const payload = {
        id: "admin_user", // A unique ID for the admin
        role: "Admin", // The crucial role identifier
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      console.log("Admin login successful.");
      // Send back the token and admin user data, just like a regular user.
      return res.status(200).json({
        message: "Admin login successful",
        token,
        userId: "admin_user",
        fullName: "Administrator",
        role: "Admin",
      });
    }

    // --- REGULAR STUDENT/HOD LOGIN LOGIC ---
    // If the credentials were not for the admin, the code continues as normal.
    const user = await User.findOne({ regId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
