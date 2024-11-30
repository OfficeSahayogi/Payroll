import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import base from "../config/api";

const ViewAttendance = () => {
  const { role, organizations, selectedOrg } = useSelector((state) => state.user); // Redux state
  const [selectedOrganization, setSelectedOrganization] = useState(selectedOrg || organizations[0]);
  const [employeeType, setEmployeeType] = useState("Staff");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attendance data
  const fetchAttendance = async () => {
    if (!startDate || !endDate) {
      Swal.fire("Error!", "Please select a start and end date.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${base.baseUrl}/api/attendance/view`, {
        params: {
          org: selectedOrganization,
          empType: employeeType,
          startDate,
          endDate,
        },
        withCredentials: true,
      });
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      Swal.fire("Error!", "Failed to fetch attendance.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">View Attendance</h2>

        {/* Organization Selector for Super Admin */}
        {role === "Super Admin" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Select Organization:</label>
            <select
              className="p-2 border rounded-lg w-full"
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
            >
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Employee Type Toggle */}
        <div className="mb-4 flex space-x-4">
          <button
            className={`p-2 px-4 rounded-lg ${employeeType === "Staff" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setEmployeeType("Staff")}
          >
            Staff
          </button>
          <button
            className={`p-2 px-4 rounded-lg ${employeeType === "Labor" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setEmployeeType("Labor")}
          >
            Labor
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Start Date:</label>
            <input
              type="date"
              className="p-2 border rounded-lg w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">End Date:</label>
            <input
              type="date"
              className="p-2 border rounded-lg w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Fetch Attendance Button */}
        <div className="mb-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={fetchAttendance}>
            Fetch Attendance
          </button>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto max-h-96">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : attendanceData.length === 0 ? (
            <p className="text-center text-gray-500">No attendance records found.</p>
          ) : (
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr className="bg-blue-100 text-blue-900 text-center">
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Code</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index} className="text-center">
                    <td className="px-4 py-2 border">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border">{record.employee.name}</td>
                    <td className="px-4 py-2 border">{record.employee.empCode}</td>
                    <td className="px-4 py-2 border">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAttendance;
