// college-portal/client/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  fetchTeachers,
  fetchSubjects,
  fetchDepartments,
  fetchUsers,
  addStudent,
  addTeacher,
  addDepartment,
  addSubject,
  assignTeacherToSubject,
  addMarks,
} from "../redux/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { students, teachers, subjects, departments, users, loading, error } =
    useSelector((state) => state.admin);

  const [newStudent, setNewStudent] = useState({
    email: "",
    password: "",
    name: "",
    department: "",
    studentId: "",
  });
  const [newTeacher, setNewTeacher] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [newDepartment, setNewDepartment] = useState({ name: "" });
  const [newSubject, setNewSubject] = useState({ name: "", departmentId: "" });
  const [newMarks, setNewMarks] = useState({
    studentId: "",
    subjectId: "",
    testDate: "",
    marks: "",
    totalMarks: "",
  });
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailValidationMessage, setEmailValidationMessage] = useState({
    student: "",
    teacher: "",
  });

  useEffect(() => {
    // Initialize dark mode on mount
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);

    // Fetch data with error handling
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudents()).unwrap(),
          dispatch(fetchTeachers()).unwrap(),
          dispatch(fetchSubjects()).unwrap(),
          dispatch(fetchDepartments()).unwrap(),
          dispatch(fetchUsers()).unwrap(), // Ensure users is fetched
        ]);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setValidationError("Failed to load data. Please refresh the page.");
      }
    };
    fetchData();
  }, [dispatch]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // Client-side email validation (case-insensitive)
    const emailExistsInUsers = users.some(
      (user) => user.email?.toLowerCase() === newStudent.email.toLowerCase()
    );

    const studentIdExists =
      newStudent.studentId &&
      students.some((student) => student.studentId === newStudent.studentId);

    if (emailExistsInUsers) {
      setValidationError("A user with this email already exists.");
      return;
    }

    if (studentIdExists) {
      setValidationError("A student with this Student ID already exists.");
      return;
    }

    try {
      await dispatch(addStudent(newStudent)).unwrap();
      setNewStudent({
        email: "",
        password: "",
        name: "",
        department: "",
        studentId: "",
      });
      setSuccessMessage("Student added successfully!");
      // Refresh users to ensure uniqueness
      await dispatch(fetchUsers()).unwrap();
    } catch (err) {
      console.error("Failed to add student:", err);
      setValidationError(err.message || "Failed to add student.");
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // Client-side email validation (case-insensitive)
    const emailExistsInUsers = users.some(
      (user) => user.email?.toLowerCase() === newTeacher.email.toLowerCase()
    );

    if (emailExistsInUsers) {
      setValidationError("A user with this email already exists.");
      return;
    }

    try {
      await dispatch(addTeacher(newTeacher)).unwrap();
      setNewTeacher({ email: "", password: "", name: "" });
      setSuccessMessage("Teacher added successfully!");
      // Refresh users to ensure uniqueness
      await dispatch(fetchUsers()).unwrap();
    } catch (err) {
      console.error("Failed to add teacher:", err);
      setValidationError(err.message || "Failed to add teacher.");
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    try {
      await dispatch(addDepartment(newDepartment)).unwrap();
      setNewDepartment({ name: "" });
      setSuccessMessage("Department added successfully!");
    } catch (err) {
      console.error("Failed to add department:", err);
      setValidationError(err.message || "Failed to add department.");
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    try {
      await dispatch(addSubject(newSubject)).unwrap();
      setNewSubject({ name: "", departmentId: "" });
      setSuccessMessage("Subject added successfully!");
    } catch (err) {
      console.error("Failed to add subject:", err);
      setValidationError(err.message || "Failed to add subject.");
    }
  };

  const handleAssignTeacher = async (subjectId, teacherId) => {
    if (teacherId) {
      setValidationError("");
      setSuccessMessage("");
      try {
        await dispatch(
          assignTeacherToSubject({ subjectId, teacherId })
        ).unwrap();
        setSuccessMessage(`Teacher assigned to subject successfully!`);
      } catch (err) {
        console.error("Failed to assign teacher:", err);
        setValidationError(err.message || "Failed to assign teacher.");
      }
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    try {
      await dispatch(addMarks({ ...newMarks, enroll: true })).unwrap();
      setNewMarks({
        studentId: "",
        subjectId: "",
        testDate: "",
        marks: "",
        totalMarks: "",
      });
      setSuccessMessage("Marks added successfully!");
    } catch (err) {
      console.error("Failed to add marks or enroll student:", err);
      setValidationError(
        err.message || "Failed to add marks or enroll student."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Admin Dashboard
        </h1>

        {/* Loading and Error/Success Messages */}
        {loading && (
          <p className="text-blue-500 dark:text-blue-400 mb-4">Loading...</p>
        )}
        {error && (
          <p className="text-red-500 dark:text-red-400 mb-4">Error: {error}</p>
        )}
        {validationError && (
          <p className="text-red-500 dark:text-red-400 mb-4">
            {validationError}
          </p>
        )}
        {successMessage && (
          <p className="text-green-500 dark:text-green-400 mb-4">
            {successMessage}
          </p>
        )}

        {/* Add Student Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add Student
          </h2>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => {
                  const email = e.target.value;
                  setNewStudent({ ...newStudent, email });
                  if (email) {
                    const emailExists = users.some(
                      (user) =>
                        user.email?.toLowerCase() === email.toLowerCase()
                    );
                    setEmailValidationMessage((prev) => ({
                      ...prev,
                      student: emailExists
                        ? "This email is already in use."
                        : "",
                    }));
                  } else {
                    setEmailValidationMessage((prev) => ({
                      ...prev,
                      student: "",
                    }));
                  }
                }}
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              />
              {emailValidationMessage.student && (
                <p className="text-red-500 dark:text-red-400 mt-1 text-sm">
                  {emailValidationMessage.student}
                </p>
              )}
            </div>
            <input
              type="password"
              placeholder="Password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({ ...newStudent, password: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <input
              type="text"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <select
              value={newStudent.department}
              onChange={(e) =>
                setNewStudent({ ...newStudent, department: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Student ID (optional)"
              value={newStudent.studentId}
              onChange={(e) =>
                setNewStudent({ ...newStudent, studentId: e.target.value })
              }
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading || emailValidationMessage.student !== ""}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Student
            </button>
          </form>
        </div>

        {/* Add Teacher Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add Teacher
          </h2>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) => {
                  const email = e.target.value;
                  setNewTeacher({ ...newTeacher, email });
                  if (email) {
                    const emailExists = users.some(
                      (user) =>
                        user.email?.toLowerCase() === email.toLowerCase()
                    );
                    setEmailValidationMessage((prev) => ({
                      ...prev,
                      teacher: emailExists
                        ? "This email is already in use."
                        : "",
                    }));
                  } else {
                    setEmailValidationMessage((prev) => ({
                      ...prev,
                      teacher: "",
                    }));
                  }
                }}
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              />
              {emailValidationMessage.teacher && (
                <p className="text-red-500 dark:text-red-400 mt-1 text-sm">
                  {emailValidationMessage.teacher}
                </p>
              )}
            </div>
            <input
              type="password"
              placeholder="Password"
              value={newTeacher.password}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, password: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <input
              type="text"
              placeholder="Name"
              value={newTeacher.name}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, name: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading || emailValidationMessage.teacher !== ""}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Teacher
            </button>
          </form>
        </div>

        {/* Add Department Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add Department
          </h2>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <input
              type="text"
              placeholder="Department Name"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Add Subject Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add Subject
          </h2>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <input
              type="text"
              placeholder="Subject Name"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            />
            <select
              value={newSubject.departmentId}
              onChange={(e) =>
                setNewSubject({ ...newSubject, departmentId: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Subject
            </button>
          </form>
        </div>

        {/* Assign Teacher to Subject */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Assign Teacher to Subject
          </h2>
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600"
            >
              <p className="text-gray-700 dark:text-white">
                {subject.name} - {subject.departmentId?.name || "No Department"}
              </p>
              <select
                value={subject.teacherId?._id || ""}
                onChange={(e) =>
                  handleAssignTeacher(subject._id, e.target.value)
                }
                className="p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Add Marks Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Add Marks
          </h2>
          <form onSubmit={handleAddMarks} className="space-y-4">
            <select
              value={newMarks.studentId}
              onChange={(e) =>
                setNewMarks({ ...newMarks, studentId: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.studentId})
                </option>
              ))}
            </select>
            <select
              value={newMarks.subjectId}
              onChange={(e) =>
                setNewMarks({ ...newMarks, subjectId: e.target.value })
              }
              required
              className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 transition-all"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
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

        {/* Students List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Students List
          </h2>
          <ul className="space-y-2">
            {students.map((student) => (
              <li
                key={student._id}
                className="p-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white"
              >
                {student.name} ({student.studentId}) - Email:{" "}
                {student.userId?.email || "N/A"} - Department:{" "}
                {student.department?.name || "Not Assigned"}
              </li>
            ))}
          </ul>
        </div>

        {/* Teachers List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Teachers List
          </h2>
          <ul className="space-y-2">
            {teachers.map((teacher) => (
              <li
                key={teacher._id}
                className="p-3 border-b border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white"
              >
                {teacher.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
