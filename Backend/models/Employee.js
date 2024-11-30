import mongoose from "mongoose"
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String },
  doj: { type: Date, required: true }, // Date of Joining
  dol: { type: Date, default: null }, // Date of Leaving; null means currently employed
  empType: { type: String, enum: ["Staff", "Labor"], required: true },
  org: { type: String, required: true },
  empCode: { type: String, required: true, unique: true },
  salaryType: { type: String, enum: ["Monthly", "Hourly", "Daily"], required: true },
  salary: { type: Number, default: 0 }, // Base Salary
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee