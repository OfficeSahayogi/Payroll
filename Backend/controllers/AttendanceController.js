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
      const attendance = attendanceMap[emp._id] || new Map(); // Ensure it's a Map
    
      // Build daily attendance data
      console.log("attendance current", attendance);
      const dailyAttendance = Array.from({ length: daysInMonth }, (_, index) => {
        const day = `${year}-${String(month).padStart(2, "0")}-${String(
          index + 1
        ).padStart(2, "0")}`;
        console.log("day", day);
    
        // Access the attendance record using Map's get method
        const attendanceRecord = attendance.get(day);
    
        if (attendanceRecord) {
          console.log("attendance show", attendanceRecord);
          return {
            date: day,
            status: attendanceRecord.status || "-",
            hoursWorked: attendanceRecord.hoursWorked || "-",
          };
        }
    
        // Default data for days with no attendance
        return {
          date: day,
          status: "-",
          hoursWorked: "-",
        };
      });
    
      return { emp, dailyAttendance }; // Include the daily attendance for each employee
    });
    

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance", error });
  }
};


export const calculateEmployeeSalaries = async (req, res) => {
  try {
    const { month, year, org } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: "Month and year are required." });
    }

    const daysInMonth = new Date(year, month, 0).getDate();

    // Fetch employees based on organization and date range
    const query = { org, $or: [{ dol: null }, { dol: { $gte: new Date(year, month - 1, 1) } }] };
    const employees = await Employee.find(query).select(
      "name empCode doj dol salaryType salary empType"
    );

    if (!employees || employees.length === 0) {
      return res.status(404).json({ success: false, message: "No employees found for the given criteria." });
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      employeeId: { $in: employees.map((emp) => emp._id) },
      year,
      month,
    });
    

    // Map attendance records for quick lookup
    const attendanceMap = attendanceRecords.reduce((map, record) => {
      map[record.employeeId] = record.attendance; // Attendance is a plain object here
      return map;
    }, {});

    const today = new Date(); // Current date
    const isCurrentMonth = year == today.getFullYear() && month == today.getMonth() + 1;

    const salaryData = employees.map((employee) => {
      let totalWorkedHours=0
      let totalWorkPH=0
      const attendance = attendanceMap[employee._id] || new Map(); // Plain object, not a Map
      let totalPresentDays = 0;
      let totalAbsentDays = 0;

      const effectiveDays = isCurrentMonth ? today.getDate() : daysInMonth;

      if (employee.salary === 0 || employee.salary === null) {
        throw new Error(`Salary for employee ${employee.empCode} (${employee.name}) is not set.`);
      }

      console.log("Processing employee:", employee.empCode, "Attendance:", attendance);

      // Iterate through days in the effective month
      for (let day = 1; day <= effectiveDays; day++) {
        const dayKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        // console.log(attendance.get(dayKey))
        const dailyAttendance = attendance.get(dayKey)||{}; // Access as a plain object
        
        console.log("Checking date:", dayKey, "Attendance record:", dailyAttendance);
        if (employee.salaryType === "Hourly" && ((dailyAttendance.status === "Present" || dailyAttendance.status === "Half-Day"))) {
          
          totalWorkedHours += dailyAttendance.hoursWorked ; // Add worked hours for hourly employees
        }
        if (dailyAttendance.status === "Present" || dailyAttendance.status === "Half-Day") {
          totalPresentDays++;
          totalWorkPH+=dailyAttendance.hoursWorked
        } else if (dailyAttendance.status === "Absent") {
          totalAbsentDays++;
        }
      }

      // If it's a past month, ensure attendance is complete
      if (!isCurrentMonth && Object.keys(attendance).length < daysInMonth) {
        throw new Error(
          `Incomplete attendance data for employee ${employee.empCode} (${employee.name}) for the month ${month}/${year}.`
        );
      }

      // Calculate salary based on salary type and effective days
      let actualSalary = 0;
      if (employee.salaryType === "Monthly") {
        if(totalAbsentDays===0)
        actualSalary = ((employee.salary / daysInMonth)/12) * totalWorkPH;
        else
        actualSalary = (((employee.salary / daysInMonth)/12) * totalWorkPH)-((employee.salary / daysInMonth)*totalAbsentDays);
      } else if (employee.salaryType === "Daily") {
        actualSalary = employee.salary * totalPresentDays;
      } else if (employee.salaryType === "Hourly") {
        const totalHours =  totalWorkedHours; // Assuming 8 hours per day
        actualSalary = employee.salary * totalHours;
      }

      return {
        empCode: employee.empCode,
        name: employee.name,
        doj: employee.doj,
        dol: employee.dol,
        salaryType:employee.salaryType,
        grossSalary: employee.salary,
        totalDays: employee.salaryType==="Hourly"?`H-${totalWorkedHours}`:`d-${totalPresentDays},H-${totalWorkPH}`,
        presentDays: totalPresentDays,
        absentDays: totalAbsentDays,
        actualSalary: actualSalary.toFixed(2),
        advances: 0, // Default value; can be updated dynamically
        netPayable: actualSalary.toFixed(2), // Adjusted by advances
      };
    });

    return res.status(200).json({ success: true, salaryData });
  } catch (error) {
    console.error("Error calculating salaries:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};






