import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import StudentsList from "../components/students/StudentsList";
import StudentList from "../components/students/StudentList";
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
    <AdminLayout>
      <div className="p-6 mx-auto">
        <h1 className="text-4xl font-bold text-themecolor-900 mb-6">
          Welcome to OJT Portal
        </h1>

        {/* User Greeting or Login Prompt */}
        {user ? (
          <div>
            <p className="text-lg text-themecolor-900 mb-4">
              Hello, <span className="font-semibold">{user.name}</span>! You are
              logged in as a{" "}
              <span className="capitalize text-themecolor-400">
                {user.role}
              </span>
              .
            </p>
            <Link
              to={`/${user.role}`}
              className="inline-block px-6 py-2 bg-themecolor-800 text-themecolor-100 rounded-lg hover:bg-themecolor-700 transition-colors mb-6"
            >
              Go to Dashboard
            </Link>

            {/* Admin-Only Section */}
            {user.role === "admin" && (
              <div>
                <StudentList />
                <TeachersList />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 max-w-md w-full bg-themecolor-900 text-themecolor-100 rounded-lg shadow-lg">
            <p className="text-lg text-themecolor-300 mb-4">
              Please{" "}
              <Link
                to="/login"
                className="text-themecolor-400 hover:underline font-semibold"
              >
                login
              </Link>{" "}
              to access your dashboard.
            </p>
            <p className="text-themecolor-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-themecolor-400 hover:underline font-semibold"
              >
                Register here
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Home;
