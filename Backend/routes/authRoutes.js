import express from "express";
import UserController from "../controllers/User.js"; // Ensure .js extension is added

const { loginUser, logoutUser } = UserController;

const router = express.Router();

// Login Route
router.post("/login", loginUser);

// Logout Route
router.post("/logout", logoutUser);

export default router;
