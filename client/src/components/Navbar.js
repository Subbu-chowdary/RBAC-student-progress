// college-portal/client/src/components/Navbar.js
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // Initialize dark mode on mount
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side: Empty */}
          <div></div>

          {/* Right Side: Dark Mode Toggle and Profile Icon */}
          <div className="flex items-center space-x-4">
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

            {/* Profile Icon */}
            <Link
              to="/profile"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 19.071A7.5 7.5 0 0112 15a7.5 7.5 0 016.879 4.071M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 12a5 5 0 100-10 5 5 0 000 10z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
