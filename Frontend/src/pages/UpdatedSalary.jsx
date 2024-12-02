import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import base from "../config/api";
import EmployeeEdit from "../Components/EmployeeEdit";

const UpdatedSalary = () => {
  const {
    role,
    organizations,
    selectedOrg: initialSelectedOrg,
  } = useSelector((state) => state.user);
  const [selectedOrg, setSelectedOrg] = useState(initialSelectedOrg || "All");
  const [employees, setEmployees] = useState([]);
  const [viewUpSal, setViewUpSal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmp, setSelectEmp] = useState(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${base.baseUrl}/api/employees/serialized`,
        {
          params: selectedOrg !== "All" ? { org: selectedOrg } : {},
          withCredentials: true,
        }
      );
      setEmployees(response.data);
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error", "Failed to fetch employees.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees on component load or when organization changes
  useEffect(() => {
    fetchEmployees();
  }, [selectedOrg]);

  const handleUpdateSalary = (employee) => {
    
    setSelectEmp(employee);
    setViewUpSal(true);
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Employee List
          </h2>

          {/* Organization Selector */}
          {role === "Super Admin" && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                Select Organization:
              </label>
              <div className="flex gap-4">
                <button
                  className={`p-2 rounded-lg ${
                    selectedOrg === "All"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedOrg("All")}
                >
                  All
                </button>
                {organizations.map((org) => (
                  <button
                    key={org}
                    className={`p-2 rounded-lg ${
                      selectedOrg === org
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setSelectedOrg(org)}
                  >
                    {org}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="text-center text-gray-500">No employees found.</p>
          ) : (
            <div
              className="relative"
              style={{ maxHeight: "420px", overflow: "hidden" }}
            >
              {/* Table Header - Fixed */}
              <table className="table-auto w-full border-collapse bg-yellow-100">
                <thead className="bg-blue-100 z-10">
                  <tr className="text-blue-900 text-center">
                    <th className="px-4 py-2 border w-[15%]">ECode</th>
                    <th className="px-4 py-2 border w-[30%]">Name</th>
                    <th className="px-4 py-2 border w-[20%] ">Salary</th>
                    <th className="px-4 py-2 border flex-1">Actions</th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable Content */}
              <div
                className="overflow-y-auto"
                style={{
                  maxHeight: "250px", // Adjust this to leave space for the header
                }}
              >
                <table className="table-auto w-full border-collapse ">
                  <tbody>
                    {employees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="text-center hover:bg-gray-100 transition"
                      >
                        <td className="px-4 py-2 border w-[15%]">{employee.empCode}</td>
                        <td className="px-4 py-2 border w-[30%]">{employee.name}</td>
                        <td className="px-4 py-2 border w-[20%]">
                          {employee.salary === null
                            ? "Pending"
                            : `₹${employee.salary}`}
                        </td>
                        <td className="px-4 py-1 border flex-1">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                            onClick={() => handleUpdateSalary(employee)}
                          >
                            Update Salary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {viewUpSal && (
        <EmployeeEdit
          employee={selectedEmp}
          onClose={setViewUpSal}
          onEmployeeUpdated={fetchEmployees}
          mode="updateSalary"
        />
      )}
    </div>
  );
};

export default UpdatedSalary;
