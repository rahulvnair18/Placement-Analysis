const jwt = require("jsonwebtoken");
const User = require("../models/user");

// This middleware is for routes that ONLY an HOD should be able to access.
const hodProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 1. Get the token from the header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token using your secret key to ensure it's valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. --- THE CRITICAL HOD CHECK ---
      // We look inside the token and check if the user's role is "HOD".
      if (decoded.role !== "HOD") {
        return res
          .status(403)
          .json({ message: "Not authorized. HOD access only." });
      }

      // 4. If the role is correct, find the user in the database and attach their
      //    information to the request object for the next function to use.
      req.user = await User.findById(decoded.id).select("-password");

      // 5. If all checks pass, allow the request to proceed to the controller.
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { hodProtect };
