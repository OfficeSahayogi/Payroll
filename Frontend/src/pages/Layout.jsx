import React from "react";
import Navbar from "./Navbar"; // Adjust path if necessary
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden overscroll-none">
      <div className="h-fit">
        <Navbar />
      </div>
      <div className="flex-1  overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
