import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("reduxState"); // Retrieve user from localStorage
 
  if (!user) {
    
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }

  return children;
};

export default ProtectedRoute;
