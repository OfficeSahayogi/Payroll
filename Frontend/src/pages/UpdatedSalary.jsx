import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import base from "../config/api";
import axios from "axios";
import Swal from "sweetalert2";

const SalaryTable = () => {
  const { role, organizations, selectedOrg } = useSelector((state) => state.user);

  const [selectedOrigin, setSelectedOrganization] = useState(
    selectedOrg || organizations[0]
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
      const response = await axios.get(`${base.baseUrl}/api/attendance/salary`, {
        params: {
          month,
          year,
          org: selectedOrigin === "All" ? organizations[0] : selectedOrigin,
        },
      });
      setSalaryData(response.data.salaryData);
      Swal.fire({
        icon: "success",
        title: "Data Loaded",
        text: "Salary data fetched successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error Fetching Data",
        text: err.response?.data?.message || "Unable to fetch salary data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
  }, [month, year, selectedOrigin]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((yr) => (
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
      </div>

      {/* Table to Display Salary Data */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : salaryData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Emp Code</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">DOJ</th>
                <th className="border border-gray-300 px-4 py-2">DOL</th>
                <th className="border border-gray-300 px-4 py-2">Gross Salary</th>
                <th className="border border-gray-300 px-4 py-2">Total Days</th>
                <th className="border border-gray-300 px-4 py-2">Present</th>
                <th className="border border-gray-300 px-4 py-2">Absent</th>
                <th className="border border-gray-300 px-4 py-2">Actual Salary</th>
                <th className="border border-gray-300 px-4 py-2">Advances</th>
                <th className="border border-gray-300 px-4 py-2">Net Payable</th>
                <th className="border border-gray-300 px-4 py-2">Signature</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map((employee, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{employee.empCode}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(employee.doj).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {employee.dol ? new Date(employee.dol).toLocaleDateString() : "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{employee.grossSalary}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.totalDays}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.presentDays}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.absentDays}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.actualSalary}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.advances}</td>
                  <td className="border border-gray-300 px-4 py-2">{employee.netPayable}</td>
                  <td className="border border-gray-300 px-4 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No data available for the selected criteria.</p>
      )}
    </div>
  );
};

export default SalaryTable;
