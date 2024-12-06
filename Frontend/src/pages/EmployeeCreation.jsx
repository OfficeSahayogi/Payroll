import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import base from "../config/api";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";

const EmployeeCreation = () => {
  const {
    role,
    organizations,
    selectedOrg: initialSelectedOrg,
  } = useSelector((state) => state.user); // Fetch role and organizations from Redux
  const [selectedOrg, setSelectedOrg] = useState(""); // Selected organization for Super Admin
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    doj: null, // Use Date object for integration with react-datepicker
    dol: null,
    empType: "Staff", // Default to "Staff"
    salaryType: "Monthly", // Default to "Fixed"
    salary: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRefDoj = useRef(null);
  const datePickerRefDol = useRef(null);

  // Set default organization based on role
  useEffect(() => {
    if (role === "Admin") {
      setSelectedOrg(initialSelectedOrg); // Use the selectedOrg from Redux for Admins
    }
    if (role === "Super Admin") {
      setSelectedOrg(""); // Allow Super Admin to choose the organization
    }
  }, [role, initialSelectedOrg]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if(value==="Labor")
    {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      salary:430
    }))}
    else{
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
  
      }))
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Helper function for formatting dates
    const formattedDate = (date) => (
      date
        ? new Date(date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          })
        : null
    );
  
    if (!selectedOrg) {
      Swal.fire({
        icon: "error",
        title: "Organization Required",
        text: "Please select an organization.",
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post(
        `${base.baseUrl}/api/employees/create`,
        {
          ...formData,
          doj: formattedDate(formData.doj),
          dol: formattedDate(formData.dol),
          org: selectedOrg,
        },
        { withCredentials: true }
      );
  
      Swal.fire({
        icon: "success",
        title: "Employee Created",
        text: `Employee created successfully. Employee Code: ${response.data.empCode}`,
      });
  
      setFormData({
        name: "",
        mobile: "",
        doj: null,
        dol: null,
        empType: "Staff",
        salaryType: "Monthly",
        salary: "",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create employee.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="h-full flex justify-center items-center bg-gray-100 p-2">
      <div className="w-full max-w-xl md:max-w-4xl lg:max-w-6xl bg-white rounded-lg shadow-lg p-2 md:p-4">
        <h2 className="text-xl font-bold text-center text-blue-900 md:text-4xl mb-4 2xl:mb-6">
          Create Employee
        </h2>

        <form onSubmit={handleSubmit} className=" space-y-2 2xl:space-y-4" autoComplete="off">
          {/* Organization Selector for Super Admin */}
          {role === "Super Admin" && (
            <div className="relative pt-2">
              <label
                htmlFor="organization"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
              >
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
                required
                autoComplete="off"
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Employee Type */}
          <div className="relative pt-2">
            <label
              htmlFor="empType"
              className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
            >
              Employee Type <span className="text-red-500">*</span>
            </label>
            <select
              name="empType"
              value={formData.empType}
              onChange={handleInputChange}
              className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              required
              autoComplete="off"
            >
              <option value="Staff">Staff</option>
              <option value="Labor">Labor</option>
            </select>
          </div>

          {/* Name and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative pt-2">
              <label
                htmlFor="name"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Employee Name"
                value={formData.name}
                onChange={handleInputChange}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
                required
                autoComplete="off"
              />
            </div>

            <div className="relative pt-2">
              <label
                htmlFor="mobile"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
              >
                Mobile
              </label>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile No."
                value={formData.mobile}
                onChange={handleInputChange}
                maxLength={10}
                autoComplete="off"
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              />
            </div>
          </div>

          {/* Date of Joining and Date of Leaving */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
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
                  selected={formData.doj}
                  onChange={(date) => setFormData({ ...formData, doj: date })}
                  dateFormat="dd-MM-yyyy"
                  className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10"
                  placeholderText="Select a date"
                  ref={datePickerRefDoj} // Attach ref to DatePicker
                  showYearDropdown // Enable year dropdown
                  scrollableYearDropdown // Make year dropdown scrollable
                  yearDropdownItemNumber={15} // Show 15 years at a time
                  required
                />
                <FaCalendarAlt
                  className="absolute left-3 text-gray-400 cursor-pointer"
                  onClick={() => datePickerRefDoj.current.setFocus()} // Open DatePicker when icon is clicked
                />
              </div>
            </div>

            <div className="relative w-full pt-2">
              <label
                htmlFor="doj"
                className="absolute z-10 text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
              >
                Date of Leaving
              </label>
              {/* DatePicker with Icon */}
              <div className="flex items-center w-full relative">
                <DatePicker
                  selected={formData.dol}
                  onChange={(date) => setFormData({ ...formData, dol: date })}
                  dateFormat="dd-MM-yyyy"
                  className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10"
                  placeholderText="Select a date"
                  ref={datePickerRefDol} // Attach ref to DatePicker
                  showYearDropdown // Enable year dropdown
                  scrollableYearDropdown // Make year dropdown scrollable
                  yearDropdownItemNumber={15} // Show 15 years at a time
                  autoComplete="off"
                />
                <FaCalendarAlt
                  className="absolute left-3 text-gray-400 cursor-pointer"
                  onClick={() => datePickerRefDol.current.setFocus()} // Open DatePicker when icon is clicked
                />
              </div>
            </div>
          </div>

          {/* Salary Type */}
          <div className="relative pt-2">
  <label
    htmlFor="salaryType"
    className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
  >
    Salary Type
  </label>
  <select
    name="salaryType"
    value={formData.salaryType}
    onChange={handleInputChange}
    className="border border-blue-400 rounded-lg outline-none p-3 w-full"
    autoComplete="off"
  >
    {/* Dynamically render options based on empType */}
    {(formData.empType === "Labor"
      ? ["Daily", "Hourly"]
      : ["Monthly", "Daily", "Hourly"]
    ).map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
</div>


          {/* Salary */}
          <div className="relative pt-2">
            <label
              htmlFor="salary"
              className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600"
            >
              Salary
            </label>
            <input
              type="number"
              name="salary"
              placeholder="Salary Amount"
              value={formData.salary}
              onChange={handleInputChange}
              className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              autoComplete="off"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className={`bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold transition-opacity ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeCreation;
