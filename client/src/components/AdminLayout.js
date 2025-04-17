import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  const [isSidebarMinimized, setIsSidebarMinimized] = useState(
    localStorage.getItem("sidebarMinimized") === "true"
  );

  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsSidebarMinimized(
        localStorage.getItem("sidebarMinimized") === "true"
      );
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  const sidebarWidth = isSidebarMinimized ? "4rem" : "16rem";

  return (
    <div className="flex min-h-screen bg-themecolor-50 transition-colors duration-300">
      <Sidebar role={user ? user.role : null} />
      <div
        className="flex-1 mt-16 transition-all duration-300 overflow-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="bg-themecolor-50">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
