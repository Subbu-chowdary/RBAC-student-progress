import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-themecolor-50 shadow-md z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-themecolor-800">
              研修監視 監視
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="text-themecolor-500 hover:text-themecolor-600 transition-colors"
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
