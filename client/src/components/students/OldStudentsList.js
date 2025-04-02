// college-portal/client/src/components/StudentsList.js
import React from "react";
import { useSelector } from "react-redux";

const OldStudentsList = () => {
  const { students, subjects, loading, error } = useSelector(
    (state) => state.admin
  );

  // Helper function to get subjects for a student based on department
  const getStudentSubjects = (student) => {
    if (!student.department?._id) return "No department assigned";
    const deptSubjects = subjects.filter(
      (subject) => subject.departmentId?._id === student.department?._id
    );
    return deptSubjects.length > 0
      ? deptSubjects.map((subject) => subject.name).join(", ")
      : "No subjects assigned";
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Students List
      </h2>
      {loading && (
        <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
      )}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white">
                  Name
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white">
                  Student ID
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white">
                  Email
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white">
                  Department
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-white">
                  Subjects
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white">
                    {student.name}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white">
                    {student.studentId || "N/A"}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white">
                    {student?.email || "N/A"}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white">
                    {student.department?.name || "Not Assigned"}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-white">
                    {getStudentSubjects(student)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">
          No students available.
        </p>
      )}
    </div>
  );
};

export default OldStudentsList;
