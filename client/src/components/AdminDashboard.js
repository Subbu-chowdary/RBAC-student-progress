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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-600">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { students, teachers, subjects, departments, users, loading, error } =
    useSelector((state) => state.admin);

  const [modalState, setModalState] = useState({
    addStudent: false,
    addTeacher: false,
    addDepartment: false,
    addSubject: false,
    addMarks: false,
  });

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
    const isDark = localStorage.getItem("darkMode") === "true";
    document.documentElement.classList.toggle("dark", isDark);

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStudents()).unwrap(),
          dispatch(fetchTeachers()).unwrap(),
          dispatch(fetchSubjects()).unwrap(),
          dispatch(fetchDepartments()).unwrap(),
          dispatch(fetchUsers()).unwrap(),
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
      await dispatch(fetchUsers()).unwrap();
      setModalState((prev) => ({ ...prev, addStudent: false }));
    } catch (err) {
      console.error("Failed to add student:", err);
      setValidationError(err.message || "Failed to add student.");
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

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
      await dispatch(fetchUsers()).unwrap();
      setModalState((prev) => ({ ...prev, addTeacher: false }));
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
      setModalState((prev) => ({ ...prev, addDepartment: false }));
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
      setModalState((prev) => ({ ...prev, addSubject: false }));
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
      setModalState((prev) => ({ ...prev, addMarks: false }));
    } catch (err) {
      console.error("Failed to add marks or enroll student:", err);
      setValidationError(
        err.message || "Failed to add marks or enroll student."
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900"> */}
      <div className="flex-1 p-6">
        <div className=" mx-auto">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-6"> */}
          <h1 className="text-3xl font-bold mb-6">
            Admin Dashboard
          </h1>
          {loading && <p className="text-blue-500 mb-4">Loading...</p>}
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          {validationError && (
            <p className="text-red-500 mb-4">{validationError}</p>
          )}
          {successMessage && (
            <p className="text-green-500 mb-4">{successMessage}</p>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addStudent: true }))
              }
            >
              <h2 className="text-xl font-semibold text-gray-800 ">
                Add Student
              </h2>
              <p className="text-gray-600">Click to add a new student</p>
            </div>
            <div
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addTeacher: true }))
              }
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Add Teacher
              </h2>
              <p className="text-gray-600">Click to add a new teacher</p>
            </div>

{/* 
            <div
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addDepartment: true }))
              }
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Add Department
              </h2>
              <p className="text-gray-600">Click to add a new department</p>
            </div>

             */}
            <div
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addSubject: true }))
              }
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Add Subject
              </h2>
              <p className="text-gray-600">Click to add a new subject</p>
            </div>
            <div
              className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addMarks: true }))
              }
            >
              <h2 className="text-xl font-semibold text-gray-800">Add Marks</h2>
              <p className="text-gray-600">Click to add student marks</p>
            </div>
          </div>

          {/* Modals */}
          <Modal
            isOpen={modalState.addStudent}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addStudent: false }))
            }
            title="Add Student"
          >
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
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                />
                {emailValidationMessage.student && (
                  <p className="text-red-500 mt-1 text-sm">
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
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <select
                value={newStudent.department}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, department: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || emailValidationMessage.student !== ""}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Student
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={modalState.addTeacher}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addTeacher: false }))
            }
            title="Add Teacher"
          >
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
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                />
                {emailValidationMessage.teacher && (
                  <p className="text-red-500 mt-1 text-sm">
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
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Name"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading || emailValidationMessage.teacher !== ""}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Teacher
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={modalState.addDepartment}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addDepartment: false }))
            }
            title="Add Department"
          >
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <input
                type="text"
                placeholder="Department Name"
                value={newDepartment.name}
                onChange={(e) =>
                  setNewDepartment({ ...newDepartment, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Department
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={modalState.addSubject}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addSubject: false }))
            }
            title="Add Subject"
          >
            <form onSubmit={handleAddSubject} className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <select
                value={newSubject.departmentId}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, departmentId: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Subject
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={modalState.addMarks}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addMarks: false }))
            }
            title="Add Marks"
          >
            <form onSubmit={handleAddMarks} className="space-y-4">
              <select
                value={newMarks.studentId}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, studentId: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="number"
                placeholder="Marks"
                value={newMarks.marks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, marks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={newMarks.totalMarks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, totalMarks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Marks
              </button>
            </form>
          </Modal>

          {/* Assign Teacher to Subject */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Assign Teacher to Subject
            </h2>
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="flex items-center justify-between p-3 border-b border-gray-200"
              >
                <p className="text-gray-700">
                  {subject.name} -{" "}
                  {subject.departmentId?.name || "No Department"}
                </p>
                <select
                  value={subject.teacherId?._id || ""}
                  onChange={(e) =>
                    handleAssignTeacher(subject._id, e.target.value)
                  }
                  className="p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
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

          {/* Students List */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Students List
            </h2>
            <ul className="space-y-2">
              {students.map((student) => (
                <li
                  key={student._id}
                  className="p-3 border-b border-gray-200 text-gray-700"
                >
                  {student.name} ({student.studentId}) - Email:{" "}
                  {student.userId?.email || "N/A"} - Department:{" "}
                  {student.department?.name || "Not Assigned"}
                </li>
              ))}
            </ul>
          </div> */}

          {/* Teachers List */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Teachers List
            </h2>
            <ul className="space-y-2">
              {teachers.map((teacher) => (
                <li
                  key={teacher._id}
                  className="p-3 border-b border-gray-200 text-gray-700"
                >
                  {teacher.name}
                </li>
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
