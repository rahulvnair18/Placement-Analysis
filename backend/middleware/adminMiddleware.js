const jwt = require("jsonwebtoken");
const User = require("../models/user");

// This middleware is for routes that ONLY an Admin should be able to access.
const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- THE CRITICAL ADMIN CHECK ---
      // We check the role from the token itself.
      if (decoded.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Not authorized. Admin access only." });
      }

      // If the role is 'Admin', we can attach a simple admin user object.
      req.user = { id: decoded.id, role: decoded.role };

      next(); // If all checks pass, proceed to the controller function.
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { adminProtect };
