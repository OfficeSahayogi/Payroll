import Employee from "../models/Employee.js";
import Attendance from "../models/AttendanceSchema.js"
export const getAttendanceDataForEmployees = async (req, res) => {
  try {
    const { date, org } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    // Parse the date and normalize to UTC
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0); // Normalize to the start of the day in UTC
    const year = selectedDate.getUTCFullYear();
    const month = (selectedDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const dateKey = selectedDate.toISOString().split("T")[0]; // Use 'YYYY-MM-DD' as the date key

    // Fetch employees whose DOJ is on or before the selected date
    console.log(selectedDate)
    const query = {
      doj: { $lte: selectedDate }, // Employees who joined on or before the date
      $or: [{ dol: null }, { dol: { $gte: selectedDate } }], // Exclude employees who left before the date
    };
    if (org) query.org = org;

    const employees = await Employee.find(query);

    if (employees.length === 0) {
      return res.status(404).json({ success: true, message: "No employees found for the given criteria." });
    }

    // Fetch attendance records for these employees for the selected year and month
    const attendanceRecords = await Attendance.find({
      employeeId: { $in: employees.map((emp) => emp._id) },
      year,
      month,
    });
    
    console.log("att",attendanceRecords)
    // Merge attendance data with employee data for the specific date
    const attendanceData = employees.map((employee) => {
      const attendanceRecord = attendanceRecords.find(
        (record) => record.employeeId.toString() === employee._id.toString()
      );
      console.log("curr",attendanceRecord)
      // Default attendance
      const attendance = {
        employeeId: employee._id,
        name: employee.name,
        doj: employee.doj,
        dol: employee.dol,
        empCode: employee.empCode,
        salaryType: employee.salaryType,
        salary: employee.salary,
        status: "Absent", // Default to 'Absent'
        hoursWorked: 0, // Default to 0 hours
      };

      // Check if attendanceRecord exists and retrieve data for the dateKey
      if (attendanceRecord) {
        let dailyAttendance;
    
        if (attendanceRecord.attendance instanceof Map) {
          dailyAttendance = attendanceRecord.attendance.get(dateKey);
        } else {
          dailyAttendance = attendanceRecord.attendance[dateKey];
        }
    
        if (dailyAttendance) {
          attendance.status = dailyAttendance.status;
          attendance.hoursWorked = dailyAttendance.hoursWorked;
        }
      }

      return attendance;
    });
    console.log("findal",attendanceData)
    return res.status(200).json({ success: true, attendanceData });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};





export const markAttendanceForEmployees = async (req, res) => {
  try {
    const { selectedDate, attendance, org } = req.body;

    if (!selectedDate || !attendance) {
      return res.status(400).json({ success: false, message: "Date and attendance data are required." });
    }

    const date = new Date(selectedDate);
    date.setUTCHours(0, 0, 0, 0); // Normalize to UTC
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Fetch employees active on the selected date
    const query = {
      doj: { $lte: date },
      $or: [{ dol: null }, { dol: { $gte: date } }],
    };
    if (org) query.org = org;

    const employees = await Employee.find(query);

    // Create a map for attendance data
    const validAttendanceData = attendance.reduce((acc, empData) => {
      acc[empData.employeeId] = empData;
      return acc;
    }, {});

    // Update attendance for employees
    const attendancePromises = employees.map(async (employee) => {
      const empAttendanceData = validAttendanceData[employee._id];
      if (empAttendanceData) {
        const { status, hoursWorked } = empAttendanceData;

        let attendanceRecord = await Attendance.findOne({ employeeId: employee._id, year, month });

        if (!attendanceRecord) {
          attendanceRecord = new Attendance({
            employeeId: employee._id,
            year,
            month,
            attendance: {},
          });
        }

        attendanceRecord.attendance.set(dateKey, { status, hoursWorked });
        await attendanceRecord.save();
      }
    });

    await Promise.all(attendancePromises);

    return res.status(200).json({ success: true, message: "Attendance marked successfully!" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getMonthlyAttendance = async (req, res) => {
  try {
    const { org, month, year } = req.query;

    const query = {
      $or: [{ dol: null }, { dol: { $gte: new Date(year, month - 1, 1) } }],
      doj: { $lte: new Date(year, month, 0) },
    };
    if (org) query.org = org;

    const employees = await Employee.find(query).select(
      "_id name empCode doj dol salaryType salary"
    );

    const attendanceRecords = await Attendance.find({
      employeeId: { $in: employees.map((emp) => emp._id) },
      month,
      year,
    });

    const attendanceMap = attendanceRecords.reduce((map, record) => {
      map[record.employeeId] = record.attendance;
      return map;
    }, {});

    const daysInMonth = new Date(year, month, 0).getDate();
    const responseData = employees.map((emp) => {
      const attendance = attendanceMap[emp._id] || {};

      // Construct the daily attendance for the entire month
      const dailyAttendance = Array.from({ length: daysInMonth }, (_, index) => {
        const day = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
        // If specific attendance is recorded for the day, use it; otherwise, default to "-"
        if (attendance[day]) {
          return {
            date: day,
            status: attendance[day].status,
            hoursWorked: attendance[day].hoursWorked,
          };
        }
        return {
          date: day,
          status: "-",
          hoursWorked: "-",
        };
      });

      return {
        empCode: emp.empCode,
        name: emp.name,
        doj: emp.doj,
        dol: emp.dol,
        salaryType: emp.salaryType,
        salary: emp.salary,
        attendance: dailyAttendance,
      };
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance", error });
  }
};



// async function fetchEmployeesForAttendance(selectedDate, org = null) {
//   try {
//     const date = new Date(selectedDate);
//     date.setUTCHours(0, 0, 0, 0); // Normalize to UTC

//     const query = { doj: { $lte: date }, isDeleted: false };
//     if (org) {
//       query.org = org;
//     }

//     const employees = await Employee.find(query);
//     return { success: true, employees };
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     return { success: false, message: error.message };
//   }
// }
