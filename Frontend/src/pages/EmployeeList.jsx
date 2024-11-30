import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaTrash, FaSortUp, FaSortDown } from "react-icons/fa";
import ViewDetailsModal from "../Components/ViewDetailsModal"
import base from "../config/api";
import EmployeeEdit from "../Components/EmployeeEdit";

const EmployeeList = () => {
  const {
    role,
    organizations,
    selectedOrg,
  } = useSelector((state) => state.user);
  const [selectedOrgin, setSelectedOrg] = useState(selectedOrg||"All");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState(null); // Field to sort by
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc
  const [selectedEmp,setSelectedEmp]=useState(null)
  const [viewDetails,setViewDetails]=useState(false)
  const [UpdateModel,setUpdateModel]=useState(false)

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${base.baseUrl}/api/employees`, {
        params: selectedOrgin !== "All" ? { org: selectedOrgin } : {},
        withCredentials: true,
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      Swal.fire("Error!", "Failed to fetch employees.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees on component load or when filters change
  useEffect(() => {
    fetchEmployees();
  }, [selectedOrgin]);

  // Sorting logic
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc"; // Toggle sort order
    setSortField(field);
    setSortOrder(order);

    const sortedEmployees = [...employees].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];

      if (field === "empCode") {
        valueA = isNaN(valueA) ? 0 : parseInt(valueA); // Handle non-numeric empCodes
        valueB = isNaN(valueB) ? 0 : parseInt(valueB);
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return order === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return order === "asc" ? valueA - valueB : valueB - valueA;
      }
    });

    setEmployees(sortedEmployees);
  };

  // Action handlers
  const handleView = (employee) => {
    setSelectedEmp(employee)
    setViewDetails(true)
  };

  const handleEdit = (employee) => {
   setSelectedEmp(employee)
   setUpdateModel(true)
  };

  const handleDelete = async (employeeId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${base.baseUrl}/api/employees/${employeeId}`, {
            withCredentials: true,
          });
          Swal.fire("Deleted!", "Employee has been deleted.", "success");
          fetchEmployees(); // Refresh the list
        } catch (error) {
          console.error("Error deleting employee:", error);
          Swal.fire("Error!", "Failed to delete employee.", "error");
        }
      }
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-gray-100 p-6">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Employee List</h2>

        {/* Organization Toggle for Super Admin */}
        <div>
        {role === "Super Admin" && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Select Organization:
            </label>
            <div className="flex gap-4">
              <button
                className={`p-2 rounded-lg ${
                  selectedOrgin === "All"
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
                    selectedOrgin === org
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
        </div>
        {/* Table Wrapper */}
        <div
          className="relative"
          style={{ maxHeight: "400px", overflow: "hidden" }}
        >
          {/* Scrollable Body */}
          <div className="overflow-y-auto" style={{ maxHeight: "350px" }}>
            <table className="table-auto w-full border-collapse">
              <thead className="sticky -top-2 bg-blue-100 z-10">
                <tr className="text-blue-900 text-center">
                  <th
                    className="px-4 py-2 border cursor-pointer flex gap-1 justify-center"
                    onClick={() => handleSort("empCode")}
                  >
                    <span> ECode </span>{" "}
                    <span>
                      {" "}
                      {sortField === "empCode" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 border cursor-pointer "
                    onClick={() => handleSort("name")}
                  >
                    <span>Name</span>
                    <span>
                      {" "}
                      {sortField === "name" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 border cursor-pointer flex gap-1  justify-center"
                    onClick={() => handleSort("doj")}
                  >
                    <span> DOJ</span>
                    <span>
                      {sortField === "doj" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </span>
                  </th>
                  <th
                    className="px-4 py-2 border cursor-pointer "
                    onClick={() => handleSort("salary")}
                  >
                    <span> Salary</span>
                    <span>
                      {sortField === "salary" &&
                        (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
                    </span>
                  </th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="text-center hover:bg-gray-100 transition"
                  >
                    <td className="px-4 py-2 border">{employee.empCode}</td>
                    <td className="px-4 py-2 border">{employee.name}</td>
                    <td className="px-4 py-2 border">
                      {new Date(employee.doj)
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")}{" "}
                      {/* dd-mm-yyyy */}
                    </td>
                    <td className="px-4 py-2 border">
                      {employee.salary ? `₹${employee.salary}` : "Pending"}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex gap-2 justify-center">
                        <button
                          className=" text-white px-3 py-1 rounded-lg flex items-center gap-1"
                          onClick={() => handleView(employee)}
                        >
                          <FaEye className="text-blue-500" />
                        </button>
                        <button
                          className=" text-white px-3 py-1 rounded-lg  flex items-center gap-1"
                          onClick={() => handleEdit(employee)}
                        >
                          <FaEdit className="text-yellow-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      { viewDetails &&
      <ViewDetailsModal onClose={setViewDetails} employee={selectedEmp}/>
      }
      {UpdateModel &&
      <EmployeeEdit onClose={setUpdateModel} employee={selectedEmp} onEmployeeUpdated={fetchEmployees}/>
      }
    </div>
  );
};

export default EmployeeList;
