// college-portal/client/src/components/AdminLayout.js
import React from "react";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex min-h-screen bg-gray-100 transition-colors duration-300">
      <Sidebar role={user ? user.role : null} />
      <div className="flex-1 ml-64 p-6">{children}</div>
    </div>
  );
};

export default AdminLayout;
