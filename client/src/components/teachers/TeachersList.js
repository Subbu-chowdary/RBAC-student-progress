// college-portal/client/src/components/TeachersList.js
import React from "react";
import { useSelector } from "react-redux";

const TeachersList = () => {
  const { teachers, loading, error } = useSelector((state) => state.admin);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Teachers List
      </h2>
      {loading && (
        <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
      )}
      {teachers.length > 0 ? (
        <ul className="space-y-2">
          {teachers.map((teacher) => (
            <li
              key={teacher._id}
              className="p-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white"
            >
              {teacher.name} - Email: {teacher.userId?.email || "N/A"}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">
          No teachers available.
        </p>
      )}
    </div>
  );
};

export default TeachersList;
