import React from "react";

const SubjectMarks = ({ marks }) => {
  return (
    <div>
      <h3>Marks</h3>
      <ul>
        {marks.map((mark) => (
          <li key={mark._id}>
            Subject: {mark.subjectId.name}, Marks: {mark.marks}/
            {mark.totalMarks}, Date:{" "}
            {new Date(mark.testDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubjectMarks;
