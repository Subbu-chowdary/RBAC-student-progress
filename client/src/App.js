// college-portal/client/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./components/Login";
import AdminPage from "./pages/AdminPage";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import ProfilePage from "./pages/ProfilePage";
import "./styles/App.css";

// PrivateRoute component for role-based access
const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useSelector((state) => state.auth);

  // If no specific role is provided, allow any authenticated user
  if (!allowedRole) {
    return user ? children : <Navigate to="/login" />;
  }

  // If a specific role is required, check it
  return user && user.role === allowedRole ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const { user } = useSelector((state) => state.auth); // Check authentication status

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Redirect root to /login if not authenticated, else show Home */}
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <PrivateRoute allowedRole="teacher">
                <TeacherPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/student"
            element={
              <PrivateRoute allowedRole="student">
                <StudentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
