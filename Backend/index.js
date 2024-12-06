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

app.use(express.json()); // Parse incoming JSON requests
app.use(cors({
  origin: 'https://glittery-biscuit-836ac9.netlify.app', // Allow requests from your Netlify frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // Allow cookies or credentials
}));
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://glittery-biscuit-836ac9.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});


app.get("/", (req, res) => {
  res.send("Payroll API is running...");
});

// Routes
app.use("/api/auth", authRoutes); // Authentication/Login routes
app.use("/api/employees", employeeRoutes); // Employee management routes
app.use("/api/attendance", attendanceRoutes);

// Start the server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


