import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import base from "../config/api";

const AttendanceMarking = () => {
  const { role, organizations, selectedOrg } = useSelector(
    (state) => state.user
  );
  const [selectedOrgin, setSelectedOrg] = useState(selectedOrg || "All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [filemployees, setFileEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const datePickerRefDoA = useRef(null);

  // Global Attendance Status
  const [globalStatus, setGlobalStatus] = useState(null); // "Present", "Half-Day", "Absent"
  const [editMode, setEditMode] = useState({
    // key as employeeId, value as field (P, A, H)
  });
  const [showManualAbsentModal, setShowManualAbsentModal] = useState(false);
  const [absentEmployeeCodes, setAbsentEmployeeCodes] = useState(""); // Comma-separated codes
  const [showManualHalfDayModal, setShowManualHalfDayModal] = useState(false);
  const [halfDayEmployeeCodes, setHalfDayEmployeeCodes] = useState("");
  // Fetch employees and attendance data for the selected date
  const fetchFileEmployeesAndAttendance = async () => {
    if (!selectedDate) return;

    // Ensure the date is formatted to match the local timezone
    const formattedDate = selectedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }); // Use "en-CA" for YYYY-MM-DD format

    try {
      const response = await axios.post(
        `${base.baseUrl}/api/attendance/mark`,
        {
          date: formattedDate, // Send the date in 'YYYY-MM-DD' format
          org: selectedOrgin === "All" ? undefined : selectedOrgin,
        },
        { withCredentials: true }
      );

      setFileEmployees(response.data.attendanceData || []);
    } catch (error) {
      if (error.status === 404) {
        Swal.fire({
          icon: "info",
          title: "No Employees Found",
          text: "There are no employees available to mark attendance on this day.",
        });
        setFileEmployees([]);
        setSelectedDate(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "An unexpected error occurred.",
        });
        setFileEmployees([]);
        setSelectedDate(null);
      }
    }
  };

  useEffect(() => {
    if (selectedDate) fetchFileEmployeesAndAttendance();
  }, [selectedDate, selectedOrgin]);

  const handleAttendanceChange = (employeeId, field, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const handleGlobalStatusChange = (status) => {
    setGlobalStatus(status); // Update global status
    const hours = status === "Present" ? 12 : status === "Absent" ? 0 : 6; // Determine hours based on status

    const updatedData = filemployees.map((e) => {
      // Update each employee's status and hoursWorked
      return {
        ...e, // Spread existing employee data
        hoursWorked: hours, // Update hoursWorked based on status
        status: status, // Set the status
      };
    });

    // Log the updated data to confirm the changes
    setFileEmployees(updatedData);
  };

  const handleSubmit = async () => {
    const formattedDate = selectedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    // Prepare attendance data in the required format
    const attendanceArray = filemployees.map((emp) => ({
      employeeId: emp.employeeId,
      status: emp.status, // Present, Absent, Half-Day, etc.
      hoursWorked: emp.hoursWorked, // Can be 12 for Present, 0 for Absent, 6 for Half-Day, etc.
    }));

    // Prepare the payload to send to the backend
    const payload = {
      selectedDate: formattedDate, // Format the date as "YYYY-MM-DD"
      attendance: attendanceArray,
      org: selectedOrgin === "All" ? undefined : selectedOrgin, // Only include org if it's not "All"
    };

    try {
      // Send the data to the backend
      const response = await axios.post(
        `${base.baseUrl}/api/attendance/markAttendence`,
        payload,
        { withCredentials: true }
      );

      Swal.fire(
        "Success",
        response.data.message || "Attendance marked successfully!",
        "success"
      );
      fetchFileEmployeesAndAttendance(); // Refresh the data after submitting
    } catch (error) {
      console.error("Error marking attendance:", error);
      Swal.fire("Error", "Failed to mark attendance.", "error");
    }
  };

  const handleDoubleClick = (employeeId, status) => {
    // Enable editing for the field
    if (status != "Absent") {
      setEditMode((prev) => ({
        ...prev,
        [employeeId]: status,
      }));
    }
  };

  const handleFieldChange = (employeeId, status, value) => {
    // Ensure mutually exclusive selection (only one field can be filled)
    const updatedData = filemployees.map((emp) => {
      if (emp.employeeId === employeeId) {
        const updatedEmp = {
          ...emp,
          status,
          hoursWorked: value, // Assume `value` is the hours worked for the field
        };
        // Clear other fields when one is filled
        return updatedEmp;
      }
      return emp;
    });

    setFileEmployees(updatedData);

    setAttendanceData((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        status,
        hoursWorked: value,
      },
    }));
  };
  const handleManualAbsentSubmit = () => {
    let codes;
    if (selectedOrgin === "Jai Durga Cottex") {
      codes = absentEmployeeCodes.split(",").map((code) => {
        let cur = code.trim();
        return `JDC-${cur}`;
      });
    } else {
      codes = absentEmployeeCodes.split(",").map((code) => code.trim());
    }

    const updatedData = filemployees.map((emp) => {
      if (codes.includes(emp.empCode)) {
        return { ...emp, status: "Absent", hoursWorked: 0 };
      }
      return emp;
    });

    setFileEmployees(updatedData);
    setShowManualAbsentModal(false); // Close the modal after updating
    setAbsentEmployeeCodes(""); // Clear the input field
  };
  const handleManualHalfDaySubmit = () => {
    let codes;
    if (selectedOrgin === "Jai Durga Cottex") {
      codes = halfDayEmployeeCodes.split(",").map((code) => {
        let cur = code.trim();
        return `JDC-${cur}`;
      });
    } else {
      codes = halfDayEmployeeCodes.split(",").map((code) => code.trim());
    }
    console.log("c",codes)
    const updatedData = filemployees.map((emp) => {
      if (codes.includes(emp.empCode)) {
        return { ...emp, status: "Half-Day", hoursWorked: 6 };
      }
      return emp;
    });

    setFileEmployees(updatedData);
    setShowManualHalfDayModal(false);
    setHalfDayEmployeeCodes("");
  };
  return (
    <div className="h-full w-full flex flex-col items-center 2xl:block bg-gray-100 p-6">
      <div className="w-full max-w-6xl 2xl:max-w-full bg-white rounded-lg shadow-md p-2">
        <div className="flex justify-between mb-1 2xl:mb-2">
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">
                Mark Attendance
              </h2>
            </div>

            {/* Date Picker */}

            <div className="relative w-full  pt-2">
              <label
                htmlFor="doj"
                className="absolute z-10 text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
              >
                Date of Joining <span className="text-red-500">*</span>
              </label>
              {/* DatePicker with Icon */}
              <div className="flex items-center w-full relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10"
                  placeholderText="Select a date"
                  ref={datePickerRefDoA} // Attach ref to DatePicker
                  showYearDropdown // Enable year dropdown
                  scrollableYearDropdown // Make year dropdown scrollable
                  yearDropdownItemNumber={15} // Show 15 years at a time
                  required
                />
                <FaCalendarAlt
                  className="absolute left-3 text-gray-400 cursor-pointer"
                  onClick={() => datePickerRefDoA.current.setFocus()} // Open DatePicker when icon is clicked
                />
              </div>
            </div>
          </div>

          {/* Organization Selector */}
          <div className="flex flex-col">
            {role === "Super Admin" && (
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Select Organization:
                </label>
                <div className="flex gap-4">
                  <button
                    className={`p-1 rounded-lg ${
                      selectedOrgin === "All"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedOrg("All")}
                  >
                    All
                  </button>
                  {organizations.map((org) => (
                    <button
                      key={org}
                      className={`p-1 rounded-lg ${
                        selectedOrgin === org
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => setSelectedOrg(org)}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end  gap-2">
              <button
                onClick={() => setShowManualAbsentModal(true)}
                className="bg-blue-900 text-white p-2 2xl:px-6 2xl:py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Mark Absent
              </button>
              <button
                onClick={() => setShowManualHalfDayModal(true)}
                className="bg-yellow-600 text-white p-2 2xl:px-6 2xl:py-3 rounded-lg font-semibold hover:bg-yellow-500"
              >
                Mark Half-Day
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        {!selectedDate ? (
          <p className="text-center text-gray-500">
            Please select a date first.
          </p>
        ) : isLoading ? (
          <p className="text-center text-gray-500">Loading employees...</p>
        ) : filemployees.length === 0 ? (
          <p className="text-center text-gray-500">
            No employees available for attendance marking.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div className="max-h-[280px] 2xl:max-h-[600px] overflow-y-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-blue-200 sticky top-0 ">
                    <tr>
                      <th className="px-4 py-2 border-b">E- Code</th>
                      <th className="px-4 py-2 border-b">Employee Name</th>
                      <th className="px-4 py-2 border-b">DOJ</th>
                      <th className="px-4 py-2 border-b">DOL</th>
                      <th className="px-4 py-2 border-b">Salary Type</th>
                      <th className="px-4 py-2 border-b flex flex-col">
                        <span>Attendance</span>
                        <div className="flex justify-center gap-4 w-full">
                          <div className="flex items-center justify-evenly  w-full">
                            <div className="flex gap-1">
                              <label className="">P</label>
                              <input
                                type="checkbox"
                                checked={globalStatus === "Present"}
                                onChange={() =>
                                  handleGlobalStatusChange("Present")
                                }
                              />
                            </div>
                            <div className="flex gap-1">
                              <label className="">A</label>
                              <input
                                type="checkbox"
                                checked={globalStatus === "Absent"}
                                onChange={() =>
                                  handleGlobalStatusChange("Absent")
                                }
                              />
                            </div>
                            <div className="flex gap-1">
                              <label className="">H</label>
                              <input
                                type="checkbox"
                                checked={globalStatus === "Half-Day"}
                                onChange={() =>
                                  handleGlobalStatusChange("Half-Day")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {filemployees.map((employee) => (
                      <tr
                        key={employee.employeeId}
                        className="hover:bg-gray-100 transition"
                      >
                        <td className="px-4 py-2 border-b">
                          {employee.empCode}
                        </td>
                        <td className="px-4 py-2 border-b">{employee.name}</td>
                        <td className="px-4 py-2 border-b">
                          {new Date(employee.doj)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {employee.dol === null
                            ? "---"
                            : new Date(employee.dol)
                                .toLocaleDateString("en-GB")
                                .replace(/\//g, "-")}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {employee.salaryType}
                        </td>
                        <td className="px-4 py-2 border-b flex gap-3 justify-evenly ">
                          {employee.salaryType === "Hourly" ? (
                            <div className=" flex  justify-evenly w-full">
                              {["Present", "Absent", "Half-Day"].map(
                                (status) => (
                                  <div key={status}>
                                    <input
                                      type="number"
                                      min="0"
                                      max="24"
                                      value={`${
                                        employee.status === status
                                          ? employee.hoursWorked
                                          : ""
                                      }`}
                                      onDoubleClick={() =>
                                        handleDoubleClick(
                                          employee.employeeId,
                                          status
                                        )
                                      }
                                      onChange={(e) =>
                                        handleFieldChange(
                                          employee.employeeId,
                                          status,
                                          Number(e.target.value)
                                        )
                                      }
                                      readOnly={
                                        editMode[employee.employeeId] !== status
                                      }
                                      className="border border-gray-300 rounded-lg p-1 w-20"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-1 justify-evenly w-full">
                              <input
                                type="text"
                                value={employee.status === "Present" ? "P" : ""}
                                readOnly
                                className="border border-gray-300 rounded-lg p-1 w-20 bg-slate-200"
                              />
                              <input
                                type="text"
                                value={employee.status === "Absent" ? "A" : ""}
                                readOnly
                                className="border border-gray-300 rounded-lg p-1 w-20 bg-slate-200"
                              />
                              <input
                                type="text"
                                value={
                                  employee.status === "Half-Day" ? "H" : ""
                                }
                                readOnly
                                className="border border-gray-300 rounded-lg p-1 w-20 bg-slate-200"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-1 2xl:mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                {isAttendanceMarked ? "Update Attendance" : "Submit Attendance"}
              </button>
            </div>
          </>
        )}
      </div>
      {showManualAbsentModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h3 className="text-xl font-bold mb-4">Mark Absent Employees</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold">
                Employee Codes (comma-separated):
              </label>
              <input
                type="text"
                value={absentEmployeeCodes}
                onChange={(e) => setAbsentEmployeeCodes(e.target.value)}
                className="border border-gray-300 p-2 w-full"
                placeholder="e.g. 1, 2, 3"
                title="Enter employee codes separated by commas (e.g., 1, 2, 3)"
              />
              <p className="text-sm text-gray-500 mt-2">
                Hover over the input for more info.
              </p>
            </div>
            <button
              onClick={handleManualAbsentSubmit}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
            <button
              onClick={() => setShowManualAbsentModal(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showManualHalfDayModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-1/3">
            <h3 className="text-xl font-bold mb-4">Mark Half-Day Employees</h3>
            <div className="mb-4">
              <label className="block text-sm font-semibold">
                Employee Codes (comma-separated):
              </label>
              <input
                type="text"
                value={halfDayEmployeeCodes}
                onChange={(e) => setHalfDayEmployeeCodes(e.target.value)}
                className="border border-gray-300 p-2 w-full"
                placeholder="e.g. 1, 2, 3"
              />
            </div>
            <button
              onClick={handleManualHalfDaySubmit}
              className="bg-yellow-600 text-white px-2 py-2 rounded-lg"
            >
              Submit
            </button>
            <button
              onClick={() => setShowManualHalfDayModal(false)}
              className="bg-gray-300 text-black px-4 py-2 rounded-lg ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;
