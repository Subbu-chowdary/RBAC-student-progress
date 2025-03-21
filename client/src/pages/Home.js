// college-portal/client/src/pages/Home.js
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center p-6 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Welcome Heading */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to College Portal
        </h1>

        {/* User Greeting or Login Prompt */}
        {user ? (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Hello, <span className="font-semibold">{user.name}</span>! You are
              logged in as a{" "}
              <span className="capitalize text-blue-500 dark:text-blue-400">
                {user.role}
              </span>
              .
            </p>
            {/* Optional: Add a link to the user's dashboard */}
            <Link
              to={`/${user.role}`}
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Please{" "}
              <Link
                to="/login"
                className="text-blue-500 dark:text-blue-400 hover:underline font-semibold"
              >
                login
              </Link>{" "}
              to access your dashboard.
            </p>
            {/* Optional: Add a link to register */}
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 dark:text-blue-400 hover:underline font-semibold"
              >
                Register here
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
