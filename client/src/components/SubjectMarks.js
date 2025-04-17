import React from "react";

const SubjectMarks = ({ marks }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md dark:bg-accent3">
      <h3 className="text-lg font-semibold text-accent3 dark:text-white mb-4">
        Marks
      </h3>
      {marks && marks.length > 0 ? (
        <ul className="space-y-3">
          {marks.map((mark) => (
            <li
              key={mark._id}
              className="p-3 border-b border-secondary dark:border-accent2 text-accent2 dark:text-white flex justify-between items-center"
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
        <p className="text-accent2 dark:text-white">No marks available.</p>
      )}
    </div>
  );
};

export default SubjectMarks;
