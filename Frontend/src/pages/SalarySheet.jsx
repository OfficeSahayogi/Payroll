import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import base from "../config/api";
import axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SalaryTable = () => {
  const { role, organizations, selectedOrg } = useSelector(
    (state) => state.user
  );

  const [selectedOrigin, setSelectedOrganization] = useState(
    selectedOrg==="All"? organizations[0]:selectedOrg
  );
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Fetch salary data
  const fetchSalaryData = async () => {
    if (!selectedOrigin) {
      Swal.fire({
        icon: "error",
        title: "Organization Missing",
        text: "Please select an organization to proceed.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${base.baseUrl}/api/attendance/salary`,
        {
          params: {
            month,
            year,
            org: selectedOrigin === "All" ? organizations[0] : selectedOrigin,
          },
        }
      );
      setSalaryData(response.data.salaryData);
      Swal.fire({
        icon: "success",
        title: "Data Loaded",
        text: "Salary data fetched successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setSalaryData([]);
      Swal.fire({
        icon: "error",
        title: "Error Fetching Data",
        text: err.response?.data?.message || "Unable to fetch salary data.",
      });
    } finally {
      setLoading(false);
    }
  };
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text(`${selectedOrigin==="Mittal Spinners"?"MS":selectedOrigin==="Jai Durga Cottex"?"JDC":"HRM"} Salary Table`, 14, 15);
  
    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Emp Code",
          "Name\nDOJ\nDOL",
          "Salary Type",
          "Gross Salary",
          "Total Days || Total Hours\nPresent\nAbsent",
          "Actual Salary",
          "Advances",
          "Net Payable",
          "Signature",
        ],
      ],
      body: salaryData.map((employee) => [
        employee.empCode,
        `${employee.name}\n${employee.doj ? formatDate(new Date(employee.doj)): "-"}\n${
          employee.dol ? formatDate(new Date(employee.dol)): "-"
        }`, // Name with DOJ and DOL
        employee.salaryType,
        employee.grossSalary || 0,
        `${
          employee.salaryType === "Hourly"
            ? `${employee.totalDays}`
            : `${employee.totalDays}`
        }\n${employee.presentDays}\n${employee.absentDays}`, // Total Days/Hours with Present and Absent
        (Number(employee.actualSalary) || 0).toFixed(2), // Ensure actualSalary is a number
        (Number(employee.advances) || 0).toFixed(2), // Ensure advances is a number
        (Number(employee.netPayable) || 0).toFixed(2), // Ensure netPayable is a number
        "", // Signature field
      ]),
      styles: { fontSize: 8, halign: "center", cellPadding: 2 }, // Smaller font for compact layout
      columnStyles: {
        0: { cellWidth: 12 }, // Emp Code
        1: { cellWidth: 40 }, // Name with DOJ and DOL
        2: { cellWidth: 30 }, // Salary Type
        3: { cellWidth: 25 }, // Gross Salary
        4: { cellWidth: 50 }, // Total Days || Total Hours with Present and Absent
        5: { cellWidth: 25 }, // Actual Salary
        6: { cellWidth: 25 }, // Advances
        7: { cellWidth: 25 }, // Net Payable
        8: { cellWidth: 30 }, // Signature
      },
      theme: "grid", // Add grid lines for clarity
      headStyles: {
        fillColor: [220, 220, 220], // Light gray header background
        textColor: 0, // Black text for headers
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] }, // Light gray for alternate rows
      margin: { top: 20 },
    });
  
    doc.save(`Salary_Table_${month}_${year}.pdf`);
  };
  
  
  

  useEffect(() => {
    fetchSalaryData();
  }, [month, year, selectedOrigin]);

  const formatDate = (currentDate) => {
    const dd = String(currentDate.getDate()).padStart(2, "0");
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const yyyy = currentDate.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between">
        <h2 className="text-center font-bold text-2xl mb-4">Salary Table</h2>

        {/* Inputs for Month, Year, and Organization */}
        <div className="flex justify-center space-x-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="p-2 border rounded-lg"
          >
            {months.map((monthName, index) => (
              <option key={index} value={index + 1}>
                {monthName}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="p-2 border rounded-lg"
          >
            {Array.from(
              { length: 10 },
              (_, i) => new Date().getFullYear() - 5 + i
            ).map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Organization Dropdown for Super Admin */}
          {role === "Super Admin" && (
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">Select Organization</option>
              {organizations.map((organization) => (
                <option key={organization} value={organization}>
                  {organization}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={fetchSalaryData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Fetch Salary
          </button>
          <button
            onClick={downloadPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Download PDF
          </button>
        </div>
      </div>
      {/* Table to Display Salary Data */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : salaryData.length > 0 ? (
        <div className="overflow-x-auto  max-h-[350px] 2xl:max-h-[600px]">
          <table className=" w-full border-collapse border border-gray-300 ">
            <thead className="sticky top-0 font-light text-xs 2xl:font-bold 2xl:text-lg ">
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 w-[5%]">
                  Emp Code
                </th>
                <th className="border border-gray-300 px-4 py-2 flex flex-col gap-3">
                  <span>Name</span>
                  <hr className="border-t border-gray-500 w-full" />
                  <span className="gap-1 flex flex-col">
                    <span>DOJ</span>
                    <span>DOL</span>
                  </span>
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Salary Type
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Gross Salary
                </th>
                <th className="border  px-4 py-2 flex flex-col gap-3">
                  <span>
                    Total Days || Total Hours
                    <hr className="border-t border-gray-500 w-full" />
                  </span>

                  <span className="flex flex-col gap-1">
                    <span>Present</span>
                    <span>Absent</span>
                  </span>
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Actual Salary
                </th>
                <th className="border border-gray-300 px-4 py-2">Advances</th>
                <th className="border border-gray-300 px-4 py-2">
                  Net Payable
                </th>
                
              </tr>
            </thead>
            <tbody className="text-center overflow-y-auto text-xs 2xl:text-lg">
              {salaryData.map((employee, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.empCode}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 flex flex-col gap-3">
                    <span className="font-bold">{employee.name}</span>
                    <hr className="border-t border-gray-400 my-2 w-full" />
                    <span className="flex flex-col gap-1">
                      <span>{formatDate(new Date(employee.doj))}</span>
                      <span>
                        {employee.dol
                          ? formatDate(new Date(employee.dol))
                          : "-"}
                      </span>
                    </span>
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {employee.salaryType}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.grossSalary}
                  </td>

                  <td className="border border-gray-300  px-4 py-2 flex flex-col gap-3">
                    <spna className="font-bold">
                      {employee.totalDays}
                      
                    </spna>
                    <hr className="border-t border-gray-500 my-2 w-full" />
                    <span className="flex flex-col gap-1">
                      <span> {employee.presentDays}</span>
                      <span> {employee.absentDays}</span>
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.actualSalary}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.advances}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.netPayable}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available for the selected criteria.
        </p>
      )}
    </div>
  );
};

export default SalaryTable;
