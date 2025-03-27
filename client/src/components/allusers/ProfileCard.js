import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserProfile } from "../../redux/slices/alluserSlice";

const ProfileCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Authentication state
  const { profile, loading, error } = useSelector((state) => state.user); // Profile state from alluserSlice

  // Fetch user profile when component mounts or user changes
  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile());
    }
  }, [user, dispatch]);

  // Return null if no user is logged in or profile data isn't available yet
  if (!user || !profile) {
    return null;
  }

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
          <span className="font-semibold">Name:</span> {profile.name}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Email:</span> {profile.email}
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
          {profile.assignedSubjects && profile.assignedSubjects.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {profile.assignedSubjects.map((subject) => (
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
            {profile.department?.name || "Not assigned"}
          </p>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 mt-4">
            Enrolled Subjects
          </h3>
          {profile.enrolledSubjects && profile.enrolledSubjects.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              {profile.enrolledSubjects.map((subject) => (
                <li key={subject._id}>{subject.name}</li>
              ))}
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
