import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import {
  FaHome,
  FaUser,
  FaTachometerAlt,
  FaChartBar,
  FaBook,
  FaUpload,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const [isMinimized, setIsMinimized] = useState(
    () => localStorage.getItem("sidebarMinimized") === "true"
  );

  useEffect(() => {
    localStorage.setItem("sidebarMinimized", isMinimized);
    window.dispatchEvent(new Event("sidebarToggle"));
  }, [isMinimized]);

  const commonLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard", icon: <FaTachometerAlt /> },
    { path: "/reports", label: "Reports", icon: <FaChartBar /> },
    {
      path: "/training-schedule",
      label: "Training Schedule",
      icon: <FaCalendarAlt />,
    },
    { path: "/student-records", label: "Student Records", icon: <FaBook /> },
    { path: "/uploads", label: "Upload Data", icon: <FaUpload /> },
  ];

  const teacherLinks = [
    { path: "/teacher", label: "Teacher Dashboard", icon: <FaTachometerAlt /> },
    { path: "/teacher/classes", label: "My Classes", icon: <FaBook /> },
    { path: "/teacher/grades", label: "Grades", icon: <FaChartBar /> },
  ];

  const studentLinks = [
    { path: "/student", label: "Student Dashboard", icon: <FaTachometerAlt /> },
    { path: "/student/courses", label: "My Courses", icon: <FaBook /> },
    { path: "/student/grades", label: "My Grades", icon: <FaChartBar /> },
  ];

  const roleSpecificLinks = (() => {
    switch (role) {
      case "admin":
        return adminLinks;
      case "teacher":
        return teacherLinks;
      case "student":
        return studentLinks;
      default:
        return [];
    }
  })();

  const allLinks = [...commonLinks, ...roleSpecificLinks];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-themecolor-125 text-themecolor-100 p-4 z-20 transition-all duration-300 ${
        isMinimized ? "w-16" : "w-64"
      }`}
      style={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <div className="flex justify-between items-center mb-6">
        {!isMinimized && (
          <h2 className="text-2xl font-bold whitespace-nowrap text-themecolor-100">
            OJT監視
          </h2>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-themecolor-300 hover:text-themecolor-200 focus:outline-none"
          aria-label={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isMinimized ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>

      <nav>
        <ul className="space-y-2">
          {allLinks.map((link, index) => (
            <li key={link.path || index} className="relative group">
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-themecolor-700 text-themecolor-100"
                      : "text-themecolor-300 hover:bg-themecolor-800"
                  }`
                }
              >
                <span className="text-xl">{link.icon}</span>
                {!isMinimized && (
                  <span className="ml-3 truncate">{link.label}</span>
                )}
                {isMinimized && (
                  <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-themecolor-800 text-themecolor-100 text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {link.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
          <li className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left p-2 rounded-lg text-themecolor-300 hover:bg-themecolor-800 transition-colors duration-200"
            >
              <span className="text-xl">
                <FaSignOutAlt />
              </span>
              {!isMinimized && <span className="ml-3">Logout</span>}
              {isMinimized && (
                <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-themecolor-800 text-themecolor-100 text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Logout
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
      {!isMinimized && (
        <p
          style={{
            bottom: 0,
            position: "absolute",
            color: "themecolor-300",
            fontSize: "12px",
            padding: "10px",
          }}
        >
          Powered by Scient Labs LLC
        </p>
      )}
    </div>
  );
};

export default Sidebar;
