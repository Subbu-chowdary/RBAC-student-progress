// college-portal/client/src/components/Navbar.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Initialize dark mode on mount
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Brand/Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              College Portal
            </Link>
            {user && (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === "teacher" && (
                  <Link
                    to="/teacher"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    Teacher Dashboard
                  </Link>
                )}
                {user.role === "student" && (
                  <Link
                    to="/student"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    Student Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side: Login/Logout and Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors"
              >
                Login
              </Link>
            )}
            {/* Dark Mode Toggle */}
            <label className="dark-mode-toggle flex items-center">
              <input
                type="checkbox"
                checked={localStorage.getItem("darkMode") === "true"}
                onChange={() => {
                  const isDark = localStorage.getItem("darkMode") === "true";
                  localStorage.setItem("darkMode", !isDark);
                  document.documentElement.classList.toggle("dark", !isDark);
                }}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-white">
                {localStorage.getItem("darkMode") === "true" ? "Dark" : "Light"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
