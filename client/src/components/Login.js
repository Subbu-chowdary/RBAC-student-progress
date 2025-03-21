// college-portal/client/src/components/Login.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Initialize dark mode on mount
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Login
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 dark:text-red-400 mb-4 text-center">
            {error}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-white mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-white mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
