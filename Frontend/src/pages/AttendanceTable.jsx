import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import base from "../config/api";

const AttendanceTable = () => {
  const { role, organizations, selectedOrg } = useSelector((state) => state.user);

  const [selectedOrganization, setSelectedOrganization] = useState(
    selectedOrg || organizations[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for month and year selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${base.baseUrl}/api/attendance/monthly`, {
        params: { org: selectedOrganization==="All"?{}:selectedOrganization, year: selectedYear, month: selectedMonth },
      });
      setAttendanceData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedOrganization, selectedMonth, selectedYear]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // Generate PDF Function
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
  
    // Organization Name and Title
    doc.text(`Attendance Sheet - ${selectedOrganization}`, 14, 10);
  
    // Prepare Table Data
    const tableHead = [
      "Sno.",
      "Name",
      "Code",
      "DOJ",
      "DOL",
      "Gross Wages",
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
      "P",
      "A",
      "Signature",
    ];
  
    const tableBody = attendanceData.map((emp, empIndex) => [
      empIndex + 1,
      emp.name,
      emp.empCode,
      new Date(emp.doj).toLocaleDateString(),
      emp.dol ? new Date(emp.dol).toLocaleDateString() : "-",
      `${emp.salary} / ${emp.salaryType}`,
      ...emp.attendance.map((day) => (day.status === "-" ? "-" : day.hoursWorked)),
      emp.attendance.filter((day) => day.status === "Present").length,
      emp.attendance.filter((day) => day.status === "Absent").length,
      "", // Empty signature column
    ]);
  
    // Calculate dynamic column widths
    const pageWidth = doc.internal.pageSize.getWidth() - 10; // Subtracting margins
    const staticColumns = 6; // Static columns (Sno, Name, Code, DOJ, DOL, Gross Wages)
    const dynamicColumns = daysInMonth + 3; // Dynamic columns (attendance days, P, A, Signature)
    const staticWidth = 150; // Total width for static columns
    const dynamicWidth = pageWidth - staticWidth; // Remaining width for dynamic columns
    const dayColumnWidth = dynamicWidth / (dynamicColumns - 3); // Width per day column
    const signatureColumnWidth = 30; // Fixed width for Signature column
  
    // Add Table to PDF
    autoTable(doc, {
      head: [tableHead],
      body: tableBody,
      startY: 20,
      styles: { fontSize: 10, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10 }, // Sno.
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 20 }, // Code
        3: { cellWidth: 25 }, // DOJ
        4: { cellWidth: 25 }, // DOL
        5: { cellWidth: 40 }, // Gross Wages
        ...Array.from({ length: daysInMonth }, (_, index) => ({
          [index + 6]: { cellWidth: dayColumnWidth }, // Day columns
        })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
        [daysInMonth + 6]: { cellWidth: 15 }, // Present (P)
        [daysInMonth + 7]: { cellWidth: 15 }, // Absent (A)
        [daysInMonth + 8]: { cellWidth: signatureColumnWidth }, // Signature
      },
      theme: "grid",
      margin: { left: 5, right: 5 },
    });
  
    // Save PDF
    doc.save(`${selectedOrganization}_Attendance_${selectedYear}-${selectedMonth}.pdf`);
  };
  

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white p-6 rounded-lg shadow-md">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-blue-900 text-center">
          Attendance for {selectedOrganization}
        </h2>

        {/* Organization, Month, and Year Selection */}
        <div className="flex justify-between items-center mb-6">
          {role === "Super Admin" && (
            <select
              className="p-2 border rounded-lg w-1/4"
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
            >
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="p-2 border rounded-lg w-1/4"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded-lg w-1/4"
          >
            {Array.from({ length: 10 }, (_, i) => selectedYear - 5 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>

          <button
            onClick={fetchAttendance}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Fetch Attendance
          </button>
        </div>

        {/* Extract PDF Button */}
        <div className="text-right mb-4">
          <button
            onClick={exportToPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Extract PDF
          </button>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto h-[300px] 2xl:h-[600px]">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Sno.</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Code</th>
                  <th className="border border-gray-300 px-4 py-2">DOJ</th>
                  <th className="border border-gray-300 px-4 py-2">DOL</th>
                  <th className="border border-gray-300 px-4 py-2">Gross Wages</th>
                  {Array.from({ length: daysInMonth }, (_, index) => (
                    <th key={index} className="border border-gray-300 px-2">
                      {index + 1}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2">Present</th>
                  <th className="border border-gray-300 px-4 py-2">Absent</th>
                  <th className="border border-gray-300 px-4 py-2">Signature</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((emp, empIndex) => (
                  <tr key={empIndex}>
                    <td className="border border-gray-300 px-4 py-2">
                      {empIndex + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.empCode}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(emp.doj).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.dol ? new Date(emp.dol).toLocaleDateString() : "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.salary} / {emp.salaryType}
                    </td>
                    {emp.attendance.map((day, dayIndex) => (
                      <td
                        key={dayIndex}
                        className="border border-gray-300 px-2 text-center"
                      >
                        {day.status === "-" ? "-" : day.hoursWorked}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {
                        emp.attendance.filter((day) => day.status === "Present")
                          .length
                      }
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {
                        emp.attendance.filter((day) => day.status === "Absent")
                          .length
                      }
                    </td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTable;
