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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
        params: {
          org: selectedOrganization === "All" ? organizations[0] : selectedOrganization,
          year: selectedYear,
          month: selectedMonth,
        },
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

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
  
    // Set header font style
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
  
    // Add Title
    doc.text(`Attendance Sheet - ${selectedOrganization}`, 14, 10);
  
    // Define Table Header
    const tableHead = [
      "Sno.",
      "Name",
      "Code",
      "DOJ",
      "DOL",
      "Gross Wages",
      ...Array.from({ length: daysInMonth }, (_, index) => String(index + 1).padStart(2, "0")), // Days in two-digit format
      "P",
      "A",
    ];
  
    // Define Table Body
    const tableBody = attendanceData.map((emp, empIndex) => [
      empIndex + 1, // Sno.
      emp?.emp?.name || "-", // Name (Do not shrink this column)
      emp?.emp?.empCode || "-", // Code
      emp?.emp?.doj ? new Date(emp.emp.doj).toLocaleDateString() : "-", // DOJ
      emp?.emp?.dol ? new Date(emp.emp.dol).toLocaleDateString() : "-", // DOL
      `${emp?.emp?.salary || "-"} / ${emp?.emp?.salaryType || "-"}`, // Gross Wages
      ...emp?.dailyAttendance?.map((day) =>
        day.status === "-" ? "-" : day.status==="Absent"?"A":day.status==="Present"?"P":"H"
      ) || [], // Attendance Hours
      emp?.dailyAttendance?.filter((day) => day.status === "Present" || day.status==="Half-Day").length || 0, // Total Presents
      emp?.dailyAttendance?.filter((day) => day.status === "Absent").length || 0, // Total Absents
    ]);
  
    // Generate Table in Landscape Mode
    autoTable(doc, {
      head: [tableHead],
      body: tableBody,
      startY: 20,
      styles: {
        fontSize: 7, // Reduced font size for compactness
        halign: "center", // Horizontal alignment for all cells
        cellPadding: 1.5, // Reduced padding for better fit
      },
      columnStyles: {
        0: { cellWidth: 8 }, // Sno.
        1: { cellWidth: 40 }, // Name (wider for readability)
        2: { cellWidth: 8 }, // Code
        3: { cellWidth: 14 }, // DOJ (smaller width)
        4: { cellWidth: 14 }, // DOL (smaller width)
        5: { cellWidth: 15 }, // Gross Wages
        // Day columns (automatically adjusted to fit within the page)
        [6 + daysInMonth]: { cellWidth: 5 }, // P (Presents)
        [7 + daysInMonth]: { cellWidth: 5 }, // A (Absents)
      },
      tableWidth: "auto", // Ensures table fits within the page
      theme: "grid", // Add grid lines for better readability
    });
  
    // Save the PDF
    doc.save(`${selectedOrganization}_Attendance_${selectedYear}-${selectedMonth}.pdf`);
  };
  
  
  const formatDate = (currentDate) => {
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const yyyy = currentDate.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">
            Attendance for {selectedOrganization}
          </h2>
          <div className="text-right">
            <button
              onClick={exportToPDF}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Export to PDF
            </button>
          </div>
        </div>
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
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto max-h-[300px] 2xl:max-h-[600px] overflow-y-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="sticky top-0 bg-blue-300">
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
                  <th className="border border-gray-300 px-4 py-2">P</th>
                  <th className="border border-gray-300 px-4 py-2">A</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((emp, empIndex) => (
                  <tr key={empIndex}>
                    <td className="border border-gray-300 px-4 py-2">{empIndex + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{emp.emp?.name || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">{emp.emp?.empCode || "-"}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.emp?.doj ? formatDate(new Date(emp.emp.doj))
                       : "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.emp?.dol ? formatDate(new Date(emp.emp.dol)) : "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {emp.emp?.salary || "-"} / {emp.emp?.salaryType || "-"}
                    </td>
                    {emp.dailyAttendance.map((day, dayIndex) => (
                      <td
                        key={dayIndex}
                        className="border border-gray-300 px-2 text-center"
                      >
                        {day.status === "-" ? "-" : day.status==="Absent"?"A":day.status==="Present"?"P":"H"}
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {emp.dailyAttendance.filter((day) => day.status === "Present"|| day.status===
                    "Half-Day").length}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {emp.dailyAttendance.filter((day) => day.status === "Absent").length}
                    </td>
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
