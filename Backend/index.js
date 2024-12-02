import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongoose/connectDB.js";
import authRoutes from "./routes/authRoutes.js"; 
import employeeRoutes from "./routes/employeeRoutes.js"
import attendanceRoutes from "./routes/AttendanceRoutes.js";



// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the Express application
const app = express();

// Middleware
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse incoming JSON requests

// Health Check Route
app.get("/", (req, res) => {
  res.send("Payroll API is running...");
});

// Routes
app.use("/api/auth", authRoutes); // Authentication/Login routes
app.use("/api/employees", employeeRoutes); // Employee management routes
app.use("/api/attendance", attendanceRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


