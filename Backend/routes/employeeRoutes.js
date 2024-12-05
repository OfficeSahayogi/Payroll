import express from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeChart,
  getSerializedEmployees,
  getEmpToAdvanceMark
  // getAttendanceEmp
} from "../controllers/employeeCon.js";

const router = express.Router();

// Create Employee
router.post("/create", createEmployee);

// Get Employees (All or by Organization)
router.get("/", getEmployees);

// Update Employee
router.put("/update/:id", updateEmployee);

// Soft Delete Employee
router.put("/delete/:id", deleteEmployee);


router.get("/chart", getEmployeeChart);

router.get("/serialized", getSerializedEmployees);
// router.get("/getAttendance",getAttendanceEmp)
router.get("/getEmpToAdvanceMark",getEmpToAdvanceMark)

export default router;
