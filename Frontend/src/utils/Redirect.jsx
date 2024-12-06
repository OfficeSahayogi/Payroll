// components/RootRedirect.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const RootRedirect = () => {
  const { role, organizations, isAuthenticated } = useSelector(
    (state) => state.user
  );
   console.log("r",role)
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role === "Super Admin") {
    return <Navigate to="/dashboard" />;
  }

  if (organizations.length === 1) {
    return <Navigate to="/dashboard" />;
  }

  return <Navigate to="/select-org" />;
};

export default RootRedirect;
