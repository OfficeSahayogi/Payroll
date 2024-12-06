import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa"; // Import Chevron Down Icon
import axios from "axios";
import Swal from "sweetalert2";
import base from "../config/api"
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/userSlice";
// import OrgCreationModalApproval from "../Pages/Modals/OrgCreationModalApproval";

function Navbar() {
  const userName=useSelector((state) => state?.user?.name)
  const dispatch=useDispatch()
  
  const navigate = useNavigate();
  const [showOsiCreationModal, setShowOsiCreationModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  //   const handleChangeMaster = (event) => {
  //     const { value } = event.target;
  //     setSelectedOption(value);
  //     if (value) {
  //       navigate(value);
  //     }
  //   };
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${base.baseUrl}/api/auth/logout`,
        {}, // Empty request body
        {
          withCredentials: true, // CORRECT: Configuration option
        }
      );
      
      // Handle successful logout
      if (response.status === 200) {
        localStorage.removeItem("reduxState");
      
        // Dispatch the logout action
        dispatch(logout());
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been logged out successfully.",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/"); // Redirect after success
        });
      } else {
        // Handle unexpected successful response
        Swal.fire({
          icon: "error",
          title: "Unexpected Response",
          text: "An unexpected response was received from the server.",
        });
      }
    } catch (e) {
      console.error("Error during logout:", e);

      // Handle specific error responses with SweetAlert
      if (e.response) {
        // Server responded with a status code outside of the 2xx range
        switch (e.response.status) {
          case 400:
            Swal.fire({
              icon: "error",
              title: "Invalid Request",
              text: "The logout request was invalid. Please try again.",
            });
            break;
          case 403:
            Swal.fire({
              icon: "error",
              title: "Unauthorized Access",
              text: "You do not have permission to log out.",
            });
            break;
          case 500:
            Swal.fire({
              icon: "error",
              title: "Server Error",
              text: "There was an issue with the server. Please try again later.",
            });
            break;
          default:
            Swal.fire({
              icon: "error",
              title: "Error",
              text: e.response.data.message || "An unexpected error occurred.",
            });
        }
      } else if (e.request) {
        // No response received from the server
        Swal.fire({
          icon: "warning",
          title: "Network Error",
          text: "No response from the server. Please check your network connection.",
        });
      } else {
        // Handle unexpected errors
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred while logging out.",
        });
      }
    }
  };

  const handleOsiExternalClick = () => {
    setShowOsiCreationModal(true); // Show the modal when "OSI External" is clicked
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  const handleCloseModal = () => {
    setShowOsiCreationModal(false);
  };
  const handleChange = (e) => {
    const selectedPath = e.target.value;
    e.target.selectedIndex = 0; // Reset dropdown to show "Create"
  
    if (selectedPath) {
      // Construct the correct path
      const fullPath = `/dashboard/${selectedPath}`;
      navigate(fullPath); // Navigate to the desired route
    }
  };
  
  return (
    <>
      <header className="flex px-2 bg-violet-50 w-full py-2 h-22">
        <div className="flex justify-center items-center ">
          <Link to="/dashboard">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/843c1a6537f4c6cb99a1860165d0b496ed55d0b76f14918e3ad16250cdaf78ce?placeholderIfAbsent=true&apiKey=81a235f4136c4623b32cac0bf8e8b9ae"
              className="w-14 object-contain"
              alt="Logo"
            />
          </Link>
        </div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex justify-between relative ">
            <div className="w-full flex justify-center  ">
              <SearchBar />
            </div>
            <div className="flex flex-1 absolute right-0 justify-end ">
              <UserIcons user={userName} handleLogout={handleLogout} />
            </div>
          </div>
          <div className="w-full flex">
            <nav className="flex flex-wrap justify-evenly items-center w-full text-[10px] lg:text-xs font-semibold leading-3 pl-5 text-center text-violet-950 ">
              <div className="flex gap-3 lg:gap-7">
                <div>
                  <select
                    defaultValue="" // Default to "Create"
                    onChange={handleChange}
                    className="gap-1 hover:border-none shadow-md p-2 my-auto bg-blue-100 rounded-lg cursor-pointer"
                  >
                    {/* Display-only "Create" option */}
                    <option value="" disabled hidden>
                      Employee
                    </option>

                    {/* Other selectable options */}
                    <option value="createEmployee">create</option>
                    <option value="listEmployee">
                      List
                    </option>
                    <option value="updateSalary">
                      Update Salary
                    </option>
                  </select>
                </div>
                <div >
                  <select
                    defaultValue="" // Default to "Create"
                    onChange={handleChange}
                    className="gap-1 hover:border-none self-stretch shadow-md p-2 my-auto bg-blue-100 rounded-lg cursor-pointer"
                  >
                    {/* Display-only "Create" option */}
                    <option value="" disabled hidden>
                    Attendance
                    </option>
                    <option value="markAttendance">
                      Mark Attendance
                    </option>
                    
                    {/* Other selectable options */}
                  </select>
                </div>
                <div >
                  <select
                    defaultValue="" // Default to "Create"
                    onChange={handleChange}
                    className="gap-1 hover:border-none  shadow-md p-2 my-auto bg-blue-100 rounded-lg cursor-pointer"
                  >
                    {/* Display-only "Create" option */}
                    <option value="" disabled hidden>
                      Advance 
                    </option>

                    {/* Other selectable options */}
                    <option value="addAdvance">Add</option>
                    <option value="advanceList">
                      List
                    </option>
                  </select>
                </div>
                <div >
                  <select
                    defaultValue="" // Default to "Create"
                    onChange={handleChange}
                    className="gap-1 hover:border-none  shadow-md p-2 my-auto bg-blue-100 rounded-lg cursor-pointer"
                  >
                    {/* Display-only "Create" option */}
                    <option value="" disabled hidden>
                      Report
                    </option>

                    {/* Other selectable options */}
                    <option value="dailyChart">
                      Daily Chart
                    </option>
                    <option value="AttendanceSheet">
                      Attendance Sheet
                    </option>
                    <option value="salarySheet">
                      Salary Sheet
                    </option>
                    <option value="absentList">
                      Absent List
                    </option>
                  </select>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Modal for OSI External */}
      {/* {showOsiCreationModal && <OrgCreationModalApproval onClose={handleCloseModal} />} */}
    </>
  );
}

function SearchBar() {
  return (
    <div className="flex text-md gap-2 items-center w-1/3  p-1 m-1 bg-blue-300 rounded-lg">
      <div className="">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/662e8bb4b9116824a1bc61959dadde0c295ce1953c5a48dc474599734cdef213?placeholderIfAbsent=true&apiKey=81a235f4136c4623b32cac0bf8e8b9ae"
          className="object-contain shrink-0 my-auto"
          alt=""
        />
      </div>
      <div className=" w-full text-white">
        <input
          type="search"
          placeholder="Search"
          className="bg-transparent shrink-0 w-full placeholder:text-white placeholder:text-center rounded-lg outline-none"
        />
      </div>
    </div>
  );
}

function UserIcons({ user, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);


  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <div className="flex flex-wrap shrink p-2 items-center justify-center gap-2 lg:gap-5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/f77842ee0f288243e66f741f4296e3e2d74de860f1e07b7e5da2a8e94c15ac43?placeholderIfAbsent=true&apiKey=81a235f4136c4623b32cac0bf8e8b9ae"
          className="object-contain w-[25px] h-[20px]"
          alt="User icon "
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c304e775ba208186b07246994392e1e404d750969286b9d8c054c5fe1860fa7?placeholderIfAbsent=true&apiKey=81a235f4136c4623b32cac0bf8e8b9ae"
          className="object-contain w-[25px] h-[20px]"
          alt="User icon 2"
        />
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/4c49d7923e2a2a415540cb29de40eb1d2ae262e1341133cb698474fb4546f827?placeholderIfAbsent=true&apiKey=81a235f4136c4623b32cac0bf8e8b9ae"
          className="object-containw-[25px] h-[20px]"
          alt="User icon 3"
        />
        <div
          className="self-stretch my-auto bg-blue-300 rounded-full w-[25px] h-[22px] text-xs p-2 flex items-center justify-center shadow-sm cursor-pointer font-semibold"
          onClick={toggleDropdown}
        >
          {user?.split(" ").length >= 2
            ? `${user.split(" ")[0][0]}${user.split(" ")[1][0]}`
            : user?.charAt(0)}
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
          <div className="px-4 py-2 text-gray-900 font-bold border-b">
            {user || "Guest"}
          </div>
          <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
            Profile
          </div>
          <div
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
