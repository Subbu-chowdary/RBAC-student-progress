import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for authentication logic
    console.log({ username, password, remember });
    // Example: navigate to dashboard on success
    // navigate("/admin/dashboard");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-themecolor-100">
      {/* Left: Image */}
      <div className="w-1/2 h-screen hidden lg:block">
        <img
          src="https://img.freepik.com/fotos-premium/imagen-fondo_910766-187.jpg?w=826"
          alt="Background"
          className="object-cover w-full h-full"
        />
      </div>
      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 p-14 bg-themecolor-50 rounded-2xl shadow-soft">
        <h1 className="text-2xl font-semibold text-themecolor-900 mb-4 font-display">
          Login
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-14">
            <label
              htmlFor="username"
              className="block text-themecolor-120 font-sans mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-themecolor-500 rounded-3xl py-2 px-3 bg-themecolor-50 text-themecolor-120 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
              autoComplete="off"
            />
          </div>
          {/* Password Input */}
          <div className="mb-14">
            <label
              htmlFor="password"
              className="block text-themecolor-120 font-sans mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-themecolor-500 rounded-3xl py-2 px-3 bg-themecolor-50 text-themecolor-120 font-sans focus:outline-none focus:ring-2 focus:ring-themecolor-600"
              autoComplete="off"
            />
          </div>
          {/* Remember Me Checkbox */}
          <div className="mb-14 flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="text-themecolor-500 focus:ring-themecolor-600"
            />
            <label
              htmlFor="remember"
              className="text-themecolor-120 font-sans ml-2"
            >
              Remember Me
            </label>
          </div>
          {/* Forgot Password Link */}
          <div className="mb-14">
            <a
              href="/forgot-password"
              className="text-themecolor-600 hover:text-themecolor-700 font-sans hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Forgot Password?
            </a>
          </div>
          {/* Login Button */}
          <button
            type="submit"
            className="bg-themecolor-600 hover:bg-themecolor-700 text-themecolor-50 font-semibold rounded-3xl py-2 px-4 w-full font-sans"
          >
            Login
          </button>
        </form>
        {/* Sign up Link */}
        <div className="mt-14 text-center">
          <a
            href="/signup"
            className="text-themecolor-600 hover:text-themecolor-700 font-sans hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
          >
            Sign up Here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
