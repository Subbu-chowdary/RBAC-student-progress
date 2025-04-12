// // college-portal/client/src/components/AdminLayout.js
// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import Sidebar from "./Sidebar";

// const AdminLayout = ({ children }) => {
//   const { user } = useSelector((state) => state.auth);

//   const [isSidebarMinimized, setIsSidebarMinimized] = useState(
//     localStorage.getItem("sidebarMinimized") === "true"
//   );

//   useEffect(() => {
//     const handleSidebarToggle = () => {
//       setIsSidebarMinimized(
//         localStorage.getItem("sidebarMinimized") === "true"
//       );
//     };

//     window.addEventListener("sidebarToggle", handleSidebarToggle);
//     return () => {
//       window.removeEventListener("sidebarToggle", handleSidebarToggle);
//     };
//   }, []);

//   return (
//     <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//       <Sidebar role={user ? user.role : null} />
//       {/* <div
//         className="flex-1 mt-16 transition-all duration-300"
//         style={{
//           marginLeft: isSidebarMinimized ? "4rem" : "16rem",
//         }}
//       > */}
//       <div
//         className={`flex-1 transition-all duration-300 ${
//           isTrainingSchedule ? "ml-0" : isMinimized ? "ml-16" : "ml-64"
//         }`}
//       >
//         {children}
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;


// college-portal/client/src/components/AdminLayout.js
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(() =>
    localStorage.getItem("sidebarMinimized") === "true"
  );
  const location = useLocation();

  useEffect(() => {
    const handleSidebarToggle = () => {
      setIsMinimized(localStorage.getItem("sidebarMinimized") === "true");
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

<<<<<<< HEAD
  const sidebarWidth = isSidebarMinimized ? "4rem" : "16rem";
=======
  // Check if current route is TrainingSchedule
  const isTrainingSchedule = location.pathname === "/training-schedule";
>>>>>>> c6670ec754f6dd237abc7e5fc99e5abd7e01c641

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div
<<<<<<< HEAD
        className="flex-1 mt-16 transition-all duration-300 overflow-auto"
        style={{ marginLeft: sidebarWidth }}
=======
        className={`flex-1 mt-16 transition-all duration-300 ${
          isTrainingSchedule ? "ml-0" : isMinimized ? "ml-16" : "ml-64"
        }`}
>>>>>>> c6670ec754f6dd237abc7e5fc99e5abd7e01c641
      >
        <main className="bg-gray-900 p-2">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;