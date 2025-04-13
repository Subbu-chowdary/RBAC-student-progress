// college-portal/client/src/pages/TeacherDashboard.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignedSubjects,
  fetchStudentsForSubject,
  addMarks,
} from "../redux/slices/teacherSlice";
import Sidebar from "../components/Sidebar";

import Spinner from "./Spinner";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { subjects, studentsForSubject, loading, error } = useSelector(
    (state) => state.teacher
  );
  const [newMarks, setNewMarks] = useState({
    studentId: "",
    subjectId: "",
    testDate: "",
    marks: "",
    totalMarks: "",
  });

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);
    dispatch(fetchAssignedSubjects());
  }, [dispatch]);

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setNewMarks({ ...newMarks, subjectId, studentId: "" });
    if (subjectId) {
      dispatch(fetchStudentsForSubject(subjectId));
    }
  };

  const handleAddMarks = (e) => {
    e.preventDefault();
    dispatch(addMarks(newMarks));
    setNewMarks({
      studentId: "",
      subjectId: "",
      testDate: "",
      marks: "",
      totalMarks: "",
    });
  };

  const uniqueSubjects = Array.from(
    new Map(subjects.map((subject) => [subject._id, subject])).values()
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar role="teacher" />
      <div className="flex-1 p-6 ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Teacher Dashboard
          </h1>
          {loading && <p className="text-blue-500 mb-4">
                      {/* Loading... */}
                      <Spinner />
                      </p>}
          {error && (
            <p className="text-red-500 dark:text-red-400 mb-4">
              Error: {error}
            </p>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Your Subjects
            </h2>
            {uniqueSubjects.length > 0 ? (
              <ul className="space-y-2">
                {uniqueSubjects.map((subject) => (
                  <li
                    key={subject._id}
                    className="p-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white"
                  >
                    {subject.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                No subjects assigned.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Add Marks
            </h2>
            <form onSubmit={handleAddMarks} className="space-y-4">
              <select
                value={newMarks.subjectId}
                onChange={handleSubjectChange}
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              >
                <option value="">Select Subject</option>
                {uniqueSubjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <select
                value={newMarks.studentId}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, studentId: e.target.value })
                }
                required
                disabled={
                  !newMarks.subjectId || studentsForSubject.length === 0
                }
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <option value="">Select Student</option>
                {studentsForSubject.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newMarks.testDate}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, testDate: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              />
              <input
                type="number"
                placeholder="Marks"
                value={newMarks.marks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, marks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={newMarks.totalMarks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, totalMarks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Marks
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
