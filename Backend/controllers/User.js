import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Login Function
const loginUser = async (req, res) => {
  const { mobile, password } = req.body;
  

  try {
    // Find the user by mobile number
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    

    // Compare the provided password with the hashed password in the database
    const isMatch = bcrypt.compareSync(password, user.password);
    

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the cookie options
    const tokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    };

    // Set the cookie and send the response
    res.cookie("token", token, tokenOptions).status(200).json({
      message: "Login successfully",
      user: user,
      success: true,
      error: false,
    });
  } catch (error) {
    
    res.status(400).json({ message: "Server error" });
  }
};

// Logout Function
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export default {
  loginUser,
  logoutUser,
};
