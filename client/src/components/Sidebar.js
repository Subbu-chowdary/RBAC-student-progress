import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import UploadDataModal from "../components/admin/UploadDataModal";

// Icons (you can use any icon library like react-icons)
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
} from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const [isMinimized, setIsMinimized] = useState(false); // State to toggle sidebar width
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const commonLinks = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard", icon: <FaTachometerAlt /> },
    { path: "/reports", label: "Reports", icon: <FaChartBar /> },
    { path: "/student-records", label: "Student Records", icon: <FaBook /> },
    {
      label: "Upload Data (Modal)",
      action: () => setIsUploadModalOpen(true),
      icon: <FaUpload />,
    },
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

  let roleSpecificLinks = [];
  switch (role) {
    case "admin":
      roleSpecificLinks = adminLinks;
      break;
    case "teacher":
      roleSpecificLinks = teacherLinks;
      break;
    case "student":
      roleSpecificLinks = studentLinks;
      break;
    default:
      roleSpecificLinks = [];
  }

  const allLinks = [...commonLinks, ...roleSpecificLinks];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-4 z-20 transition-all duration-300 ${
        isMinimized ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-between items-center mb-6">
        {!isMinimized && <h2 className="text-2xl font-bold">OJT監視</h2>}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-gray-300 hover:text-white"
        >
          {isMinimized ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>

      <nav>
        <ul className="space-y-2">
          {allLinks.map((link, index) => (
            <li key={link.path || index} className="relative group">
              {link.path ? (
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  <span className="text-xl">{link.icon}</span>
                  {!isMinimized && <span className="ml-3">{link.label}</span>}
                  {/* Tooltip for minimized state */}
                  {isMinimized && (
                    <span className="absolute left-16 bg-gray-700 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {link.label}
                    </span>
                  )}
                </NavLink>
              ) : (
                <button
                  onClick={link.action}
                  className="flex items-center w-full text-left p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">{link.icon}</span>
                  {!isMinimized && <span className="ml-3">{link.label}</span>}
                  {/* Tooltip for minimized state */}
                  {isMinimized && (
                    <span className="absolute left-16 bg-gray-700 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {link.label}
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}
          <li className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <span className="text-xl">
                <FaSignOutAlt />
              </span>
              {!isMinimized && <span className="ml-3">Logout</span>}
              {/* Tooltip for minimized state */}
              {isMinimized && (
                <span className="absolute left-16 bg-gray-700 text-white text-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Logout
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
      <UploadDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
