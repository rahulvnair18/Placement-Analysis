const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust path as needed

const protect = async (req, res, next) => {
  let token;

  // Check if the token is in the header and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user's info to the request object (without the password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move to the next function (the actual question controller)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
