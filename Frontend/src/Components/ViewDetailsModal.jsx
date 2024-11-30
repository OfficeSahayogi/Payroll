import React from "react";
import { MdArrowBack } from "react-icons/md";

const ViewDetailsModal = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl xl:max-w-4xl">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-2xl xl:text-3xl font-bold text-blue-900">Employee Details</h2>
          <button
            className="text-gray-500 text-2xl xl:text-3xl cursor-pointer hover:text-gray-700 transition"
            onClick={() => onClose(false)}
            title="Go Back"
          >
            <MdArrowBack />
          </button>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-2 gap-4 xl:gap-6">
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Name:</b> {employee.name || ""}
          </div>
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Mobile:</b> {employee.mobile || "-"}
          </div>
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Date of Joining:</b>{" "}
            {employee.doj ? new Date(employee.doj)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-") : "N/A"}
          </div>
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Employee Type:</b> {employee.empType || "N/A"}
          </div>
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Organization:</b> {employee.org || "N/A"}
          </div>
          <div className="text-lg xl:text-xl">
            <b className="text-blue-800">Code:</b> {employee.empCode || "N/A"}
          </div>
          {employee.salary && (
            <div className="text-lg xl:text-xl">
              <b className="text-blue-800">Salary:</b> ₹{employee.salary}
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => onClose(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
