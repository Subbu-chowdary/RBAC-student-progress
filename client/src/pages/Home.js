// college-portal/client/src/pages/Home.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StudentsList from "../components/students/StudentsList";
import TeachersList from "../components/teachers/TeachersList";
import {
  fetchStudents,
  fetchTeachers,
  fetchSubjects,
  fetchDepartments,
} from "../redux/slices/adminSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch data only if user is admin
    if (user && user.role === "admin") {
      dispatch(fetchStudents());
      dispatch(fetchTeachers());
      dispatch(fetchSubjects());
      dispatch(fetchDepartments());
    }
  }, [dispatch, user]);

  return (
    <div className="flex min-h-screen bg-gray-100 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar role={user ? user.role : null} />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to College Portal
          </h1>

          {/* User Greeting or Login Prompt */}
          {user ? (
            <div>
              <p className="text-lg text-gray-700 mb-4">
                Hello, <span className="font-semibold">{user.name}</span>! You
                are logged in as a{" "}
                <span className="capitalize text-blue-500">{user.role}</span>.
              </p>
              <Link
                to={`/${user.role}`}
                className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-6"
              >
                Go to Dashboard
              </Link>

              {/* Admin-Only Section */}
              {user.role === "admin" && (
                <div>
                  <StudentsList />
                  <TeachersList />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 max-w-md w-full bg-white rounded-lg shadow-lg">
              <p className="text-lg text-gray-700 mb-4">
                Please{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  login
                </Link>{" "}
                to access your dashboard.
              </p>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-500 hover:underline font-semibold"
                >
                  Register here
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
