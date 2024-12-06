import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import base from "../config/api";
import Swal from "sweetalert2";

const SubmitAdvances = () => {
  const { role, organizations, selectedOrg } = useSelector(
    (state) => state.user
  );
  const [selectedOrgin, setselectedOrgin] = useState(
    selectedOrg === "All" ? organizations[0] : selectedOrg
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [empCode, setEmpCode] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amount, setAmount] = useState("");
  const datePickerRef = useRef(null);

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedOrgin || !empCode || !paymentMode || !amount) {
      Swal.fire({
        icon: "info",
        iconColor: "red",
        confirmButtonColor: "red",
        title: "Error",
        color: "red",
        text: "All field are required",
      });
      return;
    }
    const formattedDate = selectedDate.toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    try {
      await axios.post(`${base.baseUrl}/api/attendance/addAdvance`, {
        org: selectedOrgin,
        empCode,
        paymentMode,
        date: formattedDate,
        amount: parseFloat(amount),
      });
      Swal.fire({
        icon: "info",
        title: "Successfull",
        text: "Advance submitted successfully",
      });
      // Reset form
      setEmpCode("");
      setPaymentMode("");
      setAmount("");
    } catch (error) {
      if (error.status === 404) {
        Swal.fire({
          icon: "info",
          title: "Error",
          text: error.response.data.message || "An error occurred",
        });
      } else if (error.status === 400) {
        Swal.fire({
          icon: "info",
          title: "Error",
          iconColor: "red",
          confirmButtonColor: "red",
          color: "red",
          text: error.response.data.message || "An error occurred",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          iconColor: "red",
          confirmButtonColor: "red",
          color: "red",
          text: error.response.data.message || "An unexpected error occurred.",
        });
        setFileEmployees([]);
        setSelectedDate(null);
      }
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col justify-center items-center w-[60%] border-blue-400 border rounded-md p-4 gap-4">
        <h2 className="font-bold text-4xl text-center">Mark Advances</h2>
        <div className=" flex flex-col gap-4 w-full">
          {/* Date Field */}
          <div className="relative pt-2">
            <label
              htmlFor="empType"
              className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-blue-900 z-10"
            >
              {" "}
              Date{" "}
            </label>
            <div className="relative flex items-center w-3/4">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd-MM-yyyy"
                className="border border-blue-400 rounded-lg outline-none p-3 w-full pl-10 z-110"
                placeholderText="Select a date"
                ref={datePickerRef}
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={15}
                required
              />
              <FaCalendarAlt
                className="absolute left-3 text-2xl text-gray-400 cursor-pointer"
                onClick={() => datePickerRef.current.setFocus()}
              />
            </div>
          </div>

          {/* Organization Selection (Only for Superadmin) */}
          {role === "Super Admin" && (
            <div className="flex justify-center w-full ">
              <div className="relative pt-2 w-[80%]">
                <label
                  htmlFor="empType"
                  className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-blue-900 "
                >
                  Organization:
                </label>
                <select
                  value={selectedOrgin}
                  onChange={(e) => setselectedOrgin(e.target.value)}
                  className="w-full p-2 border rounded border-blue-400"
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org} value={org}>
                      {org}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Employee Code */}
          <div className="flex justify-center w-full ">
            <div className="relative pt-2 w-[80%]">
              <label
                htmlFor="empType"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-blue-900 "
              >
                Employee Code:
              </label>
              <input
                type="text"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="Enter Employee Code"
                className="w-full p-2 border rounded border-blue-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-center w-full ">
            <div className="relative pt-2 w-[80%]">
              <label
                htmlFor="empType"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-blue-900 "
              >
                Payment Mode:
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full p-2 border rounded border-blue-400"
                required
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
          </div>

          {/* Advance Amount */}
          <div className="flex justify-center w-full ">
            <div className="relative pt-2 w-[80%]">
              <label
                htmlFor="empType"
                className="absolute text-sm md:text-base font-semibold top-1 left-3 bg-white px-1 -mt-2 text-blue-900 "
              >
                Advance Amount:
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Advance Amount"
                className="w-full p-2 border rounded border-blue-400"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              Submit Advance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitAdvances;
