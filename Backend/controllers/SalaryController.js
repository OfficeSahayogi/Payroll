export const computeAndPaySalary = async (req, res) => {
    try {
      const { year, month, org, employeeId } = req.body;
  
      const query = { isDeleted: false };
      if (org) query.org = org;
      if (employeeId) query._id = employeeId;
  
      const employees = await Employee.find(query);
  
      const salaryPromises = employees.map(async (employee) => {
        const { doj, salaryType, salary, _id: empId } = employee;
  
        const joiningDate = new Date(doj);
        const currentMonthStart = new Date(year, parseInt(month) - 1, 1);
        const currentMonthEnd = new Date(year, parseInt(month), 0);
  
        if (joiningDate > currentMonthEnd) return null;
  
        const effectiveStartDate = joiningDate > currentMonthStart ? joiningDate : currentMonthStart;
  
        const attendanceRecord = await Attendance.findOne({
          employeeId: empId,
          year,
          month,
        });
  
        let totalDaysWorked = 0;
        let totalHoursWorked = 0;
        let absentDays = 0;
  
        if (attendanceRecord) {
          for (const [date, data] of attendanceRecord.attendance.entries()) {
            const attendanceDate = new Date(date);
            if (attendanceDate >= effectiveStartDate && attendanceDate <= currentMonthEnd) {
              if (data.status === "Present") {
                totalDaysWorked++;
                totalHoursWorked += 12;
              } else if (data.status === "Half-Day") {
                totalDaysWorked += 0.5;
                totalHoursWorked += 6;
              } else if (data.status === "Absent") {
                absentDays++;
              }
            }
          }
        }
  
        const totalDaysInMonth = currentMonthEnd.getDate();
        const totalWorkingHours = totalDaysInMonth * 12;
  
        const deductionHours = absentDays * 12;
        const deduction =
          salaryType === "Monthly"
            ? (deductionHours / totalWorkingHours) * salary
            : absentDays * salary;
  
        let totalSalary = salaryType === "Monthly"
          ? salary - deduction
          : salaryType === "Daily"
          ? totalDaysWorked * salary
          : totalHoursWorked * salary;
  
        const existingSalaryRecord = await Salary.findOne({ employeeId: empId, year, month });
  
        let advanceTaken = 0;
        if (existingSalaryRecord) {
          advanceTaken = existingSalaryRecord.advanceTaken;
        }
  
        const netSalary = totalSalary - advanceTaken;
  
        const salaryRecord = await Salary.findOneAndUpdate(
          { employeeId: empId, year, month },
          {
            employeeId: empId,
            year,
            month,
            baseSalary: salary,
            totalDaysWorked,
            totalHoursWorked,
            totalSalary,
            advanceTaken,
            netSalary,
          },
          { upsert: true, new: true }
        );
  
        return salaryRecord;
      });
  
      const salaries = await Promise.all(salaryPromises);
  
      res.status(200).json({ success: true, message: "Salaries computed and saved successfully.", salaries });
    } catch (error) {
      
      res.status(500).json({ success: false, message: error.message });
    }
  };

  export const markAdvance = async (req, res) => {
    try {
      const { employeeId, year, month, advanceAmount } = req.body;
  
      if (!employeeId || !year || !month || advanceAmount === undefined) {
        return res.status(400).json({ success: false, message: "Employee ID, year, month, and advance amount are required." });
      }
  
      const salaryRecord = await Salary.findOne({ employeeId, year, month });
  
      if (salaryRecord) {
        // Update existing record to add advance
        salaryRecord.advanceTaken += advanceAmount;
        salaryRecord.netSalary = salaryRecord.totalSalary - salaryRecord.advanceTaken;
        await salaryRecord.save();
      } else {
        // Create a new salary record with advance
        const newSalaryRecord = new Salary({
          employeeId,
          year,
          month,
          baseSalary: 0, // Placeholder if base salary isn't available yet
          totalDaysWorked: 0,
          totalHoursWorked: 0,
          totalSalary: 0,
          advanceTaken: advanceAmount,
          netSalary: -advanceAmount, // Net salary will be updated later when full salary is computed
        });
        await newSalaryRecord.save();
      }
  
      return res.status(200).json({ success: true, message: "Advance marked successfully." });
    } catch (error) {
      
      res.status(500).json({ success: false, message: "An error occurred while marking advance." });
    }
  };
  