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
import Reports from "./components/admin/Reports";
import TrainingSchedule from "./components/admin/TrainingSchedule"; // Import the new component
import StudentRecords from "./components/admin/StudentRecords"; // Import the new component
import StudentDetails from "./components/students/StudentDetails";
import AdminLayout from "./components/AdminLayout";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import ProfilePage from "./pages/ProfilePage";
import "./styles/App.css";

// PrivateRoute component for role-based access
const PrivateRoute = ({ children, allowedRole }) => {
  const { user } = useSelector((state) => state.auth);

  if (!allowedRole) {
    return user ? children : <Navigate to="/login" />;
  }

  return user && user.role === allowedRole ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <AdminPage />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <Reports />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/student-records"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <StudentRecords />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/student/:id"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <StudentDetails />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/training-schedule"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <TrainingSchedule />
                </AdminLayout>
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
