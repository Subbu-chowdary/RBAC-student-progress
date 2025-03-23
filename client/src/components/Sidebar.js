// college-portal/client/src/components/Sidebar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice"; // Import logout action

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Get user from Redux store
  const role = user?.role; // Get role from user object

  const commonLinks = [
    { path: "/", label: "Home" },
    { path: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Admin Dashboard" },
    { path: "/admin/users", label: "Manage Users" },
    { path: "/admin/reports", label: "Reports" },
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
    dispatch(logout()); // Dispatch logout action to clear Redux state and localStorage
    navigate("/login"); // Redirect to login page
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
          {allLinks.map((link) => (
            <li key={link.path}>
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
    </div>
  );
};

export default Sidebar;
