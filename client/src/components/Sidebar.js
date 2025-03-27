// college-portal/client/src/components/Sidebar.js
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import UploadDataModal from "../components/admin/UploadDataModal";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const commonLinks = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard" },
    { path: "/admin/reports", label: "Reports" }, // Correct link to /admin/reports
    { label: "Upload Data (Modal)", action: () => setIsUploadModalOpen(true) },
  ];

  const teacherLinks = [
    { path: "/teacher", label: "Teacher Dashboard" },
    { path: "/teacher/classes", label: "My Classes" },
    { path: "/teacher/grades", label: "Grades" },
  ];

  const studentLinks = [
    { path: "/student", label: "Student Dashboard" },
    { path: "/student/courses", label: "My Courses" },
    { path: "/student/grades", label: "My Grades" },
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
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-20">
      <h2 className="text-2xl font-bold mb-6">
        {role
          ? `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`
          : "College Portal"}
      </h2>
      <nav>
        <ul className="space-y-2">
          {allLinks.map((link, index) => (
            <li key={link.path || index}>
              {link.path ? (
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `block p-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ) : (
                <button
                  onClick={link.action}
                  className="block w-full text-left p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {link.label}
                </button>
              )}
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="block w-full text-left p-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Logout
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
