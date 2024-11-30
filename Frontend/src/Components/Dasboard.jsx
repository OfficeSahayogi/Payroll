import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { selectOrganization } from "../store/userSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { role, organizations, selectedOrg } = useSelector((state) => state.user);
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       if (role === "Super Admin") {
  //         const response = await axios.get("/api/employees", { withCredentials: true });
  //         setData(response.data);
  //       } else if (selectedOrg) {
  //         const response = await axios.get(
  //           `/api/employees?organization=${selectedOrg}`,
  //           { withCredentials: true }
  //         );
  //         setData(response.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     }
  //   };

  //   fetchData();
  // }, [role, selectedOrg]);

  const handleChangeOrg = async () => {
    // If the user has access to multiple organizations
    if (organizations.length > 1) {
      const { isConfirmed, value } = await Swal.fire({
        title: "Change Organization",
        text: "Do you want to switch to another organization?",
        icon: "warning",
        input: "select",
        inputOptions: organizations.reduce((options, org) => {
          if (org !== selectedOrg) {
            options[org] = org;
          }
          return options;
        }, {}),
        inputPlaceholder: "Select an organization",
        showCancelButton: true,
        confirmButtonText: "Switch",
        cancelButtonText: "Cancel",
      });

      if (isConfirmed && value) {
        // Dispatch the new organization to Redux
        dispatch(selectOrganization(value));
        Swal.fire({
          title: "Switched Organization",
          text: `You are now viewing data for ${value}`,
          icon: "success",
        });
      }
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4  text-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {role === "Admin" && organizations.length > 1 && (
          <button
            onClick={handleChangeOrg}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Change Organization
          </button>
        )}
      </header>

      <div className="p-4">
        {role === "Super Admin" && <p>Data for all organizations:</p>}
        {role === "Admin" && selectedOrg && <p>Data for organization: {selectedOrg}</p>}
        {/* <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul> */}
      </div>
    </div>
  );
};

export default Dashboard;
