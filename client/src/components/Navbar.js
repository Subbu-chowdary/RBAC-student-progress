import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {user ? (
        <>
          {user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
          {user.role === "teacher" && (
            <Link to="/teacher">Teacher Dashboard</Link>
          )}
          {user.role === "student" && (
            <Link to="/student">Student Dashboard</Link>
          )}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
