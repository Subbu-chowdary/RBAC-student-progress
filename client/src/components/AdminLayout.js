import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useLocation, matchPath } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("sidebarMinimized") === "true";
    }
    return false;
  });

  const location = useLocation();

  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsSidebarMinimized(
        localStorage.getItem("sidebarMinimized") === "true"
      );
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, []);

  const isTrainingSchedule = matchPath("/training-schedule", location.pathname);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div
        className={`flex-1 mt-16 transition-all duration-300 ${
          isTrainingSchedule ? "ml-0" : isSidebarMinimized ? "ml-16" : "ml-64"
        }`}
      >
        <main className="bg-gray-100 p-2">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
