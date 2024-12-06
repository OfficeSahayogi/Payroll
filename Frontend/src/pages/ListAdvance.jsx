import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import base from "../config/api";

const ViewAdvances = () => {
  const { role, organizations, selectedOrg } = useSelector((state) => state.user);
  const [selectedOrgin, setselectedOrgin] = useState(
    selectedOrg === "All" ? organizations[0] : selectedOrg
  );
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [advances, setAdvances] = useState([]);

  const fetchAdvances = async () => {
    try {
      const response = await axios.get(`${base.baseUrl}/api/attendance/getEmployeeAdvancesByMonth`, {
        params: {
          org: selectedOrgin,
          month,
          year,
        },
      });

      setAdvances(response.data || []);

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Advances Loaded",
        text: `Successfully fetched advances for ${selectedOrgin} (${month}/${year}).`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error fetching advances:", error);

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch advances. Please try again later.",
      });
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [selectedOrgin, month, year]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">View Advances</h2>
        <select
          value={selectedOrgin}
          onChange={(e) => setselectedOrgin(e.target.value)}
          className="p-2 border rounded"
        >
          {organizations.map((org) => (
            <option key={org} value={org}>
              {org}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <label>Month:</label>
          <DatePicker
            selected={new Date(year, month - 1)}
            onChange={(date) => {
              setMonth(date.getMonth() + 1);
              setYear(date.getFullYear());
            }}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="p-2 border rounded"
          />
        </div>
      </div>
      <div className="max-h-[280px] 2xl:max-h-[600px] overflow-y-auto">
      <table className="w-full table-auto border-collapse border">
        <thead className="sticky top-0 ">
          <tr className="bg-gray-100">
            <th className="border p-2">Employee Code</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">DOJ</th>
            <th className="border p-2">DOL</th>
            <th className="border p-2">Advance Date</th>
            <th className="border p-2">Advance Amount</th>
          </tr>
        </thead>
        <tbody className="text-center">
          {advances.length > 0 && (
            advances.map((emp) => (
              <React.Fragment key={emp.empCode}>
                {emp.advances.length > 0 &&  (
                  emp.advances.map((adv, idx) => (
                    <tr key={`${emp.empCode}-${idx}`}>
                      <td className="border p-2">{emp.empCode}</td>
                      <td className="border p-2">{emp.name}</td>
                      <td className="border p-2">{formatDate(emp.doj)}</td>
                      <td className="border p-2">{emp?.dol?formatDate(emp.dol):"-"}</td>
                      <td className="border p-2">{formatDate(adv.date)}</td>
                      <td className="border p-2">₹{adv.amount}</td>
                    </tr>
                  ))
                ) }
              </React.Fragment>
            ))
          )}
          {
            advances.length === 0 && (
              <p>No advances found for the selected month.</p>
            )
          }
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ViewAdvances;
