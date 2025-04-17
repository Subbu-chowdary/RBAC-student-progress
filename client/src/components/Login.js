import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authChecked, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ identifier, password }));
    if (login.fulfilled.match(result)) {
      localStorage.setItem("token", result.payload.token);
      navigate("/");
    }
  };

  if (!authChecked) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-themecolor-100 flex items-center justify-center p-14">
      <div className="bg-themecolor-50 p-14 rounded-2xl shadow-soft w-full max-w-md border border-themecolor-400">
        <h2 className="text-3xl font-bold text-themecolor-900 mb-6 text-center font-display">
          Login
        </h2>

        {error && (
          <p className="text-red-500 mb-6 text-center font-sans">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-themecolor-120 mb-2 font-sans">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 border-2 border-themecolor-400 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 transition-colors text-themecolor-120 placeholder-themecolor-120 font-sans"
              placeholder="Enter your username or email"
            />
          </div>
          <div>
            <label className="block text-themecolor-120 mb-2 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-2 border-themecolor-400 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 transition-colors text-themecolor-120 placeholder-themecolor-120 font-sans"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition-colors disabled:bg-themecolor-300 disabled:cursor-not-allowed font-sans"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
