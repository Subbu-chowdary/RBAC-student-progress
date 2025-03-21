// college-portal/client/src/components/SubjectMarks.js
import React from "react";

const SubjectMarks = ({ marks }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Marks
      </h3>
      {marks && marks.length > 0 ? (
        <ul className="space-y-3">
          {marks.map((mark) => (
            <li
              key={mark._id}
              className="p-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex justify-between items-center"
            >
              <span>
                <span className="font-medium">Subject:</span>{" "}
                {mark.subjectId?.name || "Unknown Subject"}
              </span>
              <span>
                <span className="font-medium">Marks:</span> {mark.marks}/
                {mark.totalMarks}
              </span>
              <span>
                <span className="font-medium">Date:</span>{" "}
                {mark.testDate
                  ? new Date(mark.testDate).toLocaleDateString()
                  : "Unknown Date"}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">No marks available.</p>
      )}
    </div>
  );
};

export default SubjectMarks;
