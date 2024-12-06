// components/RootRedirect.js
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { Login } from "./Login";

const CheckLoginRedirect = () => {
    console.log("i am here")
  const { role, organizations, isAuthenticated } = useSelector(
    (state) => state.user
  );
  if(role)
  {
    console.log("i am in role")
    return <Navigate to="/dashboard" />
  }
  else{

    return <Login/>
  }
}
export default CheckLoginRedirect