import Employee from "../models/Employee.js";

// Helper Function: Generate Unique Employee Code
// const generateEmpCode = async (org, empType) => {
//   let prefix = "";
//   let start = 0;
//   let end = 0;

//   // Define ranges based on organization and type
//   switch (org) {
//     case "Mittal Spinners":
//       prefix = "";
//       start = empType === "Staff" ? 1 : 101;
//       end = empType === "Staff" ? 100 : 200;
//       break;
//     case "HRM Spinners":
//       prefix = "";
//       start = empType === "Staff" ? 301 : 401;
//       end = empType === "Staff" ? 400 : 500;
//       break;
//     case "Jai Durga Cottex":
//       prefix = "JDC-";
//       start = empType === "Staff" ? 1 : 101;
//       end = empType === "Staff" ? 100 : 200;
//       break;
//     default:
//       throw new Error("Invalid organization");
//   }

//   // Fetch all employees for the given organization and type
//   const employees = await Employee.find({
//     org,
//     empType,
//   });

//   // Extract and validate employee codes
//   const activeCodes = employees
//     .filter((e) => !e.isDeleted) // Only active employees
//     .map((e) => {
//       const match = e.empCode.match(/\d+$/); // Extract the numeric part of the code
//       return match ? parseInt(match[0], 10) : null;
//     })
//     .filter((code) => code !== null && code >= start && code <= end); // Ensure valid range

//   const deletedCodes = employees
//     .filter((e) => e.isDeleted) // Only deleted employees
//     .map((e) => {
//       const match = e.empCode.match(/\d+$/); // Extract the numeric part of the code
//       return match ? parseInt(match[0], 10) : null;
//     })
//     .filter((code) => code !== null && code >= start && code <= end); // Ensure valid range

//   // Find reusable codes from deleted employees
//   const reusableCodes = deletedCodes.filter((code) => !activeCodes.includes(code));

//   // Step 1: Reuse the smallest deleted code, if available
//   if (reusableCodes.length > 0) {
//     return `${prefix}${Math.min(...reusableCodes)}`;
//   }

//   // Step 2: Generate a new code if no reusable codes are available
//   const sortedActiveCodes = activeCodes.sort((a, b) => a - b);
//   for (let i = start; i <= end; i++) {
//     if (!sortedActiveCodes.includes(i)) {
//       return `${prefix}${i}`; // Return the first available code
//     }
//   }

//   // Step 3: If no codes are available, throw an error
//   throw new Error("No available codes in the range");
// };

const generateEmpCode = async (org, empType) => {
  let prefix = "";
  let start = 0;
  let end = 0;

  // Define ranges based on organization and type
  switch (org) {
    case "Mittal Spinners":
      prefix = "";
      start = empType === "Staff" ? 1 : 101;
      end = empType === "Staff" ? 100 : 200;
      break;
    case "HRM Spinners":
      prefix = "";
      start = empType === "Staff" ? 301 : 401;
      end = empType === "Staff" ? 400 : 500;
      break;
    case "Jai Durga Cottex":
      prefix = "JDC-";
      start = empType === "Staff" ? 1 : 101;
      end = empType === "Staff" ? 100 : 200;
      break;
    default:
      throw new Error("Invalid organization");
  }

  // Fetch all employees for the given organization and type
  const employees = await Employee.find({ org, empType });

  const activeCodes = employees
    .filter((e) => !e.dol || new Date(e.dol) > new Date()) // Exclude employees who have left
    .map((e) => {
      const match = e.empCode.match(/\d+$/); // Extract the numeric part of the empCode
      return match ? parseInt(match[0], 10) : null;
    })
    .filter((code) => code !== null && code >= start && code <= end);

  const sortedCodes = activeCodes.sort((a, b) => a - b);
  for (let i = start; i <= end; i++) {
    if (!sortedCodes.includes(i)) {
      return `${prefix}${i}`; // Return the first available code
    }
  }

  throw new Error("No available codes in the range");
};




// Create Employee
export const createEmployee = async (req, res) => {
  console.log(req.body)
  try {
    const { name, mobile, doj, dol, empType, org, salaryType } = req.body;
    let { salary } = req.body;
    salary = salary != null ? salary : 0;

    if (dol && new Date(dol) <= new Date(doj)) {
      return res.status(400).json({ message: "Date of Leaving must be after Date of Joining." });
    }

    const empCode = await generateEmpCode(org, empType);

    const newEmployee = new Employee({
      name,
      mobile,
      doj: new Date(doj),
      dol: dol ? new Date(dol) : null,
      empType,
      org,
      salaryType,
      salary,
      empCode,
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee created successfully.", empCode });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Failed to create employee.", error: error.message });
  }
};







// Read Employees (All or by Organization)
export const getEmployees = async (req, res) => {
  try {
    const { org } = req.query;

    // Initialize query object
    const query = {
      $or: [{ dol: null }, { dol: { $gte: new Date() } }], // Only employees whose dol is null or in the future
    };

    // Add organization filter if provided
    if (org) query.org = org;

    // Fetch employees
    const employees = await Employee.find(query).sort({ empCode: 1 });

    // Return response
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees", error: error.message });
  }
};





// Update Employee

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, doj, dol, empType, salaryType, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    if (dol && new Date(dol) <= new Date(doj || employee.doj)) {
      return res.status(400).json({ message: "Date of Leaving must be after Date of Joining." });
    }

    employee.name = name || employee.name;
    employee.mobile = mobile || employee.mobile;
    employee.doj = doj ? new Date(doj) : employee.doj;
    employee.dol = dol ? new Date(dol) : employee.dol;
    employee.empType = empType || employee.empType;
    employee.salaryType = salaryType || employee.salaryType;
    employee.salary = salary != null ? salary : employee.salary;

    await employee.save();
    res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Failed to update employee.", error: error.message });
  }
};






// Soft Delete Employee



export const deleteEmployee = async (req, res) => {

  const { id } = req.params;
  console.log(id)

  try {
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.isDeleted) {
      return res.status(400).json({ message: "Employee is already deleted." });
    }

    employee.isDeleted = true;

    await employee.save();

    res.status(200).json({ message: "Employee deleted successfully." });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Failed to delete employee.", error: error.message });
  }
};




// Backend Route
export const getEmployeeChart = async (req, res) => {
  try {
    const { org } = req.query;

    if (!org) {
      return res.status(400).json({ message: "Organization is required." });
    }

    // Fetch employees for the given organization who are active
    // Active means either `dol` is null or greater than or equal to today
    const employees = await Employee.find({
      org,
      $or: [{ dol: null }, { dol: { $gte: new Date() } }], // Active employees only
    }).sort({ empCode: 1 });

    const chart = [];
    const ranges = {
      "Mittal Spinners": { staff: [1, 100], labor: [101, 200] },
      "HRM Spinners": { staff: [301, 400], labor: [401, 500] },
      "Jai Durga Cottex": { staff: [1, 100], labor: [101, 200], prefix: "JDC-" },
    };

    const range = ranges[org] || {};

    // Determine prefix for organization
    const prefix = range.prefix || "";

    // Populate the chart with staff and labor ranges
    ["staff", "labor"].forEach((type) => {
      const [start, end] = range[type] || [];
      for (let code = start; code <= end; code++) {
        const fullCode = `${prefix}${code}`; // Add prefix to code if applicable
        const employee = employees.find((emp) => emp.empCode == fullCode);
        chart.push({
          code: fullCode, // Include prefixed code in the response
          name: employee ? employee.name : "",
          type: type === "staff" ? "Staff" : "Labor",
        });
      }
    });

    // Return the generated chart
    res.status(200).json(chart);
  } catch (error) {
    console.error("Error generating employee chart:", error);
    res.status(500).json({ message: "Failed to generate chart.", error });
  }
};



// Controller to get employees with serialized data
export const getSerializedEmployees = async (req, res) => {
  try {
    const { org } = req.query;

    // Fetch employees filtered by organization (if provided)
    const query = {
      $or: [{ dol: null }, { dol: { $gte: new Date() } }], // Only employees whose dol is null or in the future
    };

    // Add organization filter if provided
    if (org) query.org = org;

    const employees = await Employee.find(query).sort({salary:1});

    

    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees." });
  }
};

// Add this route
// export const getAttendanceEmp = async (req, res) => {
//   console.log(req.query)
//   const { date, org,role} = req.query;

//   try {
//     const query = {
//       isDeleted: false,
//       doj: { $lte: new Date(date) }, // Only employees who joined before the selected date
//     };

//     if (org && org !== "All" && role !== "Super Admin") {
//       query.org = org; // Filter by organization
//     }

//     const filemployees = await Employee.find(query)


//     res.status(200).json({
//       filemployees,
//     });
//   } catch (error) {
//     console.error("Error fetching employees:", error);
//     res.status(500).json({ message: "Failed to fetch employees." });
//   }
// };

