import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1>Welcome to College Portal</h1>
      {user ? (
        <p>
          Hello, {user.name}! You are logged in as a {user.role}.
        </p>
      ) : (
        <p>
          Please <Link to="/login">login</Link> to access your dashboard.
        </p>
      )}
    </div>
  );
};

export default Home;
