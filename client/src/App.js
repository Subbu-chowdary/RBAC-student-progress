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
import TrainingSchedule from "./components/admin/TrainingSchedule";
import StudentRecords from "./components/admin/StudentRecords";
import UploadDataModal from "./components/admin/UploadDataModal";
import StudentDetails from "./components/students/StudentDetails";
import AdminLayout from "./components/AdminLayout";
import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import ProfilePage from "./pages/ProfilePage";
import "./styles/App.css";

import Spinner from "./components/Spinner"; // Import the Spinner component

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth
  );

  if (!authChecked) {
    // return <div>Loading...</div>;
    return <Spinner />; // Replace Loading... with Spinner
  }

  if (!allowedRole) {
    return isAuthenticated ? children : <Navigate to="/login" />;
  }

  return isAuthenticated && user && user.role === allowedRole ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);

  if (!authChecked) {
    // return <div>Loading...</div>;
    return <Spinner />; // Replace Loading... with Spinner
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
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
            path="/uploads"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminLayout>
                  <UploadDataModal />
                </AdminLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
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
