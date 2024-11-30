import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectOrganization } from "../store/userSlice";

const SelectOrg = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizations } = useSelector((state) => state.user);

  const handleSelectOrg = (org) => {
    // Dispatch the selected organization to Redux
    dispatch(selectOrganization(org));
    // Redirect to the dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Select Organization</h1>
      <p className="mb-6 text-gray-700">Please select an organization to proceed:</p>

      <ul className="w-full max-w-md space-y-3">
        {organizations.map((org) => (
          <li key={org}>
            <button
              onClick={() => handleSelectOrg(org)}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            >
              {org}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectOrg;
