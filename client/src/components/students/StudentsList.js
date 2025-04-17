import React from "react";
import { useSelector } from "react-redux";
import Spinner from "../Spinner";

const StudentsList = () => {
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
    <div className="bg-themecolor-50 p-14 rounded-2xl shadow-soft mb-14">
      <h2 className="text-2xl font-semibold text-themecolor-900 mb-4 font-display">
        Students List
      </h2>
      {loading && (
        <p className="text-themecolor-600 mb-14 font-sans">
          <Spinner />
        </p>
      )}
      {error && <p className="text-red-500 mb-14 font-sans">Error: {error}</p>}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-themecolor-200">
                <th className="border border-themecolor-400 px-4 py-2 text-left text-themecolor-120 font-sans">
                  Name
                </th>
                <th className="border border-themecolor-400 px-4 py-2 text-left text-themecolor-120 font-sans">
                  Student ID
                </th>
                <th className="border border-themecolor-400 px-4 py-2 text-left text-themecolor-120 font-sans">
                  Email
                </th>
                <th className="border border-themecolor-400 px-4 py-2 text-left text-themecolor-120 font-sans">
                  Department
                </th>
                <th className="border border-themecolor-400 px-4 py-2 text-left text-themecolor-120 font-sans">
                  Subjects
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-themecolor-100">
                  <td className="border border-themecolor-400 px-4 py-2 text-themecolor-120 font-sans">
                    {student.name}
                  </td>
                  <td className="border border-themecolor-400 px-4 py-2 text-themecolor-120 font-sans">
                    {student.studentId || "N/A"}
                  </td>
                  <td className="border border-themecolor-400 px-4 py-2 text-themecolor-120 font-sans">
                    {student.userId?.email || "N/A"}
                  </td>
                  <td className="border border-themecolor-400 px-4 py-2 text-themecolor-120 font-sans">
                    {student.department?.name || "Not Assigned"}
                  </td>
                  <td className="border border-themecolor-400 px-4 py-2 text-themecolor-120 font-sans">
                    {getStudentSubjects(student)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-themecolor-120 font-sans">No students available.</p>
      )}
    </div>
  );
};

export default StudentsList;
