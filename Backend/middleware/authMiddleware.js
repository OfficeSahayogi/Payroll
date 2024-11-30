import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to protect routes and attach user info
export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify JWT and attach user info to the request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Middleware to restrict access to Super Admins
export const restrictToSuperAdmin = (req, res, next) => {
  if (req.user.role !== "Super Admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// Middleware to restrict access to Admin's organizations
export const restrictToAdminOrOrg = (req, res, next) => {
  const { role, organizations } = req.user;
  const { organization } = req.query; // Organization from the query or route params

  if (role === "Super Admin" || organizations.includes(organization)) {
    return next();
  }

  res.status(403).json({ message: "Access denied for this organization" });
};
