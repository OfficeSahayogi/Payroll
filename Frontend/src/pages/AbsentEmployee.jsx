import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import base from "../config/api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AbsentEmployees = () => {
  const { role, organizations, selectedOrg } = useSelector(
    (state) => state.user
  );

  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current date
  const [org, setOrg] = useState(selectedOrg === "All" ? organizations[0] : selectedOrg); // Selected organization
  const [absentEmployees, setAbsentEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const datePickerRefDoA = useRef(null);

  const fetchAbsentEmployees = async () => {
    const date = selectedDate.getDate();
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();

    if (!org) {
      Swal.fire({
        icon: "error",
        title: "Organization Missing",
        text: "Please select an organization to proceed.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${base.baseUrl}/api/attendance/absentEmp`, {
        params: { date, month, year, org },
      });
      setAbsentEmployees(response.data.data);
      Swal.fire({
        icon: "success",
        title: "Data Loaded",
        text: "Absent employees fetched successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setAbsentEmployees([]);
      Swal.fire({
        icon: "error",
        title: "Error Fetching Data",
        text: err.response?.data?.message || "Unable to fetch absent employees.",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
  
    // Title at the top of the page
    doc.text(`${org==="Mittal Spinners"?"MS":org==="Jai Durga Cottex"?"JDC":"HRM"} Absent Employees`, 14, 15);
  
    // Date at the left corner of the page
    doc.text(`Date: ${formatDate(selectedDate)}`, 14, 25);
  
    // Table data setup
    const tableData = absentEmployees.map((employee) => [
      employee.empCode,
      employee.name,
      employee.salaryType,
    ]);
  
    // Create the table in the PDF
    doc.autoTable({
      head: [["Emp Code", "Name", "Salary Type"]],
      body: tableData,
      startY: 30, // Start the table below the date
      theme: "grid",
      styles: { fontSize: 8 },
    });
  
    // Save the PDF with the formatted filename
    doc.save(`Absent_Employees_${selectedOrg}_${formatDate(selectedDate)}.pdf`);
  };
  

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-center font-bold text-2xl mb-4">Absent Employees</h2>
      <div className="flex justify-between">
        <div>
          {role === "Super Admin" && (
            <div className="flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">
                  Select Organization:
                </label>
                <div className="flex gap-4">
                  {organizations.map((Cuorg) => (
                    <button
                      key={Cuorg}
                      className={`p-1 rounded-lg ${
                        org === Cuorg ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => {
                        setOrg(Cuorg);
                      }}
                    >
                      {Cuorg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="relative w-full pt-2">
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
        <div className="">
          <button
            className="bg-blue-500 hover:bg-blue-200 p-2 rounded-lg text-white font-semibold mr-2"
            onClick={fetchAbsentEmployees}
          >
            Get Details
          </button>
          <button
          onClick={exportToPDF}
          className="bg-green-500 hover:bg-green-200 p-2 rounded-lg text-white font-semibold"
        >
          Export to PDF
          </button>
        </div>
      </div>

      {/* PDF Export Button */}
      

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : absentEmployees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Emp Code</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Salary Type</th>
              </tr>
            </thead>
            <tbody>
              {absentEmployees.map((employee, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{employee.empCode}</td>
                  <td className="border px-4 py-2">{employee.name}</td>
                  <td className="border px-4 py-2">{employee.salaryType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No employees are absent.</p>
      )}
    </div>
  );
};

export default AbsentEmployees;
