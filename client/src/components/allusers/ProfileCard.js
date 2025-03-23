// college-portal/client/src/components/ProfileCard.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTeachers,
  fetchStudents,
  fetchSubjects,
  fetchDepartments,
} from "../../redux/slices/adminSlice";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { students, teachers, subjects, departments, loading, error } =
    useSelector((state) => state.admin);

  useEffect(() => {
    if (user && user.role === "admin") {
      dispatch(fetchStudents());
      dispatch(fetchTeachers());
      dispatch(fetchSubjects());
      dispatch(fetchDepartments());
    } else if (user && user.role === "teacher") {
      dispatch(fetchTeachers());
      dispatch(fetchSubjects());
    } else if (user && user.role === "student") {
      dispatch(fetchStudents());
      dispatch(fetchSubjects());
      dispatch(fetchDepartments());
    }
  }, [user, dispatch]);

  // Get role-specific data
  const getRoleData = () => {
    if (!user) return null;

    switch (user.role) {
      case "admin":
        return { name: user.name, email: user.email };
      case "teacher":
        const teacher = teachers.find((t) => t.userId?._id === user._id);
        return {
          name: teacher?.name || user.name,
          email: teacher?.userId?.email || user.email,
          assignedSubjects: teacher?.assignedSubjects || [],
        };
      case "student":
        const student = students.find((s) => s.userId?._id === user._id);
        return {
          name: student?.name || user.name,
          email: student?.userId?.email || user.email,
          enrolledSubjects: student?.enrolledSubjects || [],
          department: student?.department,
        };
      default:
        return null;
    }
  };

  const profileData = getRoleData();

  if (!profileData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        Profile
      </h2>
      {loading && (
        <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
      )}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Name:</span> {profileData.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Email:</span> {profileData.email}
        </p>
        <p className="text-gray-700 dark:text-gray-300 capitalize">
          <span className="font-semibold">Role:</span> {user.role}
        </p>
      </div>

      {/* Role-Specific Info */}
      {user.role === "teacher" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Assigned Subjects
          </h3>
          {profileData.assignedSubjects.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {profileData.assignedSubjects.map((subject) => (
                <li key={subject._id}>{subject.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              No subjects assigned.
            </p>
          )}
        </div>
      )}

      {user.role === "student" && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Department
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {profileData.department?.name || "Not assigned"}
          </p>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 mt-4">
            Enrolled Subjects
          </h3>
          {profileData.enrolledSubjects.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {profileData.enrolledSubjects.map((subjectId) => {
                const subject = subjects.find((s) => s._id === subjectId);
                return <li key={subjectId}>{subject?.name || "Unknown"}</li>;
              })}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              No subjects enrolled.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
