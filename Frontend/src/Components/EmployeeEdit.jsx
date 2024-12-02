import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCalendarAlt } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import DatePicker from "react-datepicker";
import { useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import base from "../config/api";

const EmployeeEdit = ({ employee, onClose, onEmployeeUpdated,mode="edit"}) => {

  const [selectedOrg,setSelectedOrg]=useState(employee.org)
  const { role, organizations} = useSelector((state) => state.user);

  const [formData, setFormData] = useState({

    empCode: employee?.empCode || "",
    name: employee?.name || "",
    mobile: employee?.mobile || "",
    doj: employee?.doj ? new Date(employee.doj) : null,
    dol: employee?.dol ? new Date(employee.dol) : null,
    empType: employee?.empType || "Staff",
    salaryType: employee?.salaryType || "Monthly",
    salary: employee?.salary || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const datePickerRefDoj = useRef(null);
  const datePickerRefDol = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formattedDate = (date) => (
      date
        ? new Date(date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          })
        : null
    );
  
    try {
      // Make the PUT request to update the employee
      const response = await axios.put(
        `${base.baseUrl}/api/employees/update/${employee._id}`,
        {
          ...formData,
          org: selectedOrg,
          doj: formattedDate(formData.doj),
          dol: formattedDate(formData.dol),
        },
        { withCredentials: true }
      );
  
      // Show success notification
      Swal.fire({
        icon: "success",
        title: "Employee Updated",
        text: response.data.message || `{${mode === "updateSalary"?"Salary Updated Successfully":"Employee details have been successfully updated."}`,
      });
  
      // Trigger the callback to fetch the updated list and close the modal
      onEmployeeUpdated(); // Call the parent function to refresh the employee list
      onClose(false) // Close the modal
    } catch (error) {
      console.error("Error updating employee:", error);
  
      // Show error notification
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update employee.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl xl:text-3xl font-bold text-blue-900">{`${mode === "updateSalary"?"Update Salary":"Update Employee Details"}`}</h2>
          <button
            className="text-gray-500 text-2xl xl:text-3xl cursor-pointer hover:text-gray-700 transition"
            onClick={() => onClose(false)}
            title="Go Back"
          >
            <MdArrowBack />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
        {role === "Super Admin" && mode !="updateSalary" ? (
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
                className="border border-blue-400 rounded-lg outline-none p-3 w-full "
                
              >
                <option value="">Select Organization</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>
          ):
          (
            <div className="relative pt-2">
            <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
              Organization
            </label>
            <input
              type="text"
              name="empCode"
              value={selectedOrg}
              disabled
              className="border border-blue-400 rounded-lg outline-none p-3 w-full bg-gray-100"
            />
          </div>
          )
          }
          {/* EmpCode (Read-only) */}
          <div className="relative pt-2">
            <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
              Employee Code
            </label>
            <input
              type="text"
              name="empCode"
              value={formData.empCode}
              disabled
              className="border border-blue-400 rounded-lg outline-none p-3 w-full bg-gray-100"
            />
          </div>
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
              readonly={mode === "updateSalary"}
              autoComplete="off"
            >
              <option value="Staff">Staff</option>
              <option value="Labor">Labor</option>
            </select>
          </div>
          {/* Name and Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
                disabled={mode === "updateSalary"}
              />
            </div>

            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Mobile
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                maxLength={10}
                disabled={mode === "updateSalary"}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              />
            </div>
          </div>

          {/* Date of Joining and Date of Leaving */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base z-10 font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Date of Joining
              </label>
              <div className="flex items-center">
                <DatePicker
                  selected={formData.doj}
                  onChange={(date) => setFormData({ ...formData, doj: date })}
                  dateFormat="dd-MM-yyyy"
                  className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10"
                  placeholderText="Select a date"
                  ref={datePickerRefDoj}
                  disabled={mode === "updateSalary"}
                />
                <FaCalendarAlt
                  className="absolute left-3 text-gray-400 cursor-pointer"
                  onClick={() => datePickerRefDoj.current.setFocus()}
                />
              </div>
            </div>

            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base font-semibold z-10 top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Date of Leaving
              </label>
              <div className="flex items-center">
                <DatePicker
                  selected={formData.dol}
                  onChange={(date) => setFormData({ ...formData, dol: date })}
                  dateFormat="dd-MM-yyyy"
                  className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10"
                  placeholderText="Select a date"
                  ref={datePickerRefDol}
                  disabled={mode === "updateSalary"}
                />
                <FaCalendarAlt
                  className="absolute left-3 text-gray-400 cursor-pointer"
                  onClick={() => datePickerRefDol.current.setFocus()}
                />
              </div>
            </div>
          </div>

          {/* Salary and Salary Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Salary
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              />
            </div>
            <div className="relative pt-2">
              <label className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-gray-600">
                Salary Type
              </label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleInputChange}
                className="border border-blue-400 rounded-lg outline-none p-3 w-full"
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className={`bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold transition-opacity ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeEdit;
