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
import "./styles/App.css";
const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useSelector((state) => state.auth);
  return user && user.role === allowedRole ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
