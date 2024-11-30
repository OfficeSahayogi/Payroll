import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  year: { type: Number, required: true }, // e.g., 2024
  month: { type: String, required: true }, // e.g., '11' for November
  baseSalary: { type: Number, required: true }, // Monthly/Hourly/Daily Salary
  totalDaysWorked: { type: Number, required: true }, // Calculated from attendance
  totalHoursWorked: { type: Number, default: 0 }, // Only applicable for Hourly employees
  totalSalary: { type: Number, required: true }, // Final calculated salary
  advanceTaken: { type: Number, default: 0 }, // Advance amount taken
  netSalary: { type: Number, required: true }, // Final net salary after adjustments
  createdAt: { type: Date, default: Date.now },
});

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
