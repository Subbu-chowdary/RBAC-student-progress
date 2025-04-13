import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

import Spinner from "./Spinner"; // Import the Spinner component


const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);

    if (authChecked && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authChecked, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ identifier, password }));
    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  if (!authChecked) {
    // return <div>Loading...</div>;
    return <Spinner />; // Replace Loading... with Spinner
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-6 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-black mb-2 font-medium">
              Name or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-black placeholder-gray-500"
              placeholder="Enter your username or email"
            />
          </div>
          <div>
            <label className="block text-black mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-black placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
