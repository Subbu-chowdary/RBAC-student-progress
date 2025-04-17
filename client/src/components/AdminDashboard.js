import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  fetchTeachers,
  fetchSubjects,
  fetchDepartments,
  fetchUsers,
  addTeacher,
  addDepartment,
  addSubject,
  assignTeacherToSubject,
  addMarks,
} from "../redux/slices/adminSlice";
import AddStudentModel from "./models/addStudentModel";
import Modal from "./models/modal";

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
      console.error("Failed to add trainer:", err);
      setValidationError(err.message || "Failed to add trainer.");
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
    <div className="flex min-h-screen bg-themecolor-100">
      <div className="flex-1 p-14 bg-themecolor-50">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold text-themecolor-900 mb-14 font-display">
            Admin Dashboard
          </h1>
          {loading && (
            <p className="text-themecolor-600 mb-14 font-sans">Loading...</p>
          )}
          {error && (
            <p className="text-red-500 mb-14 font-sans">Error: {error}</p>
          )}
          {validationError && (
            <p className="text-red-500 mb-14 font-sans">{validationError}</p>
          )}
          {successMessage && (
            <p className="text-green-500 mb-14 font-sans">{successMessage}</p>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-14">
            <div
              className="bg-themecolor-50 p-6 rounded-2xl shadow-soft cursor-pointer hover:bg-themecolor-200 transition-colors"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addStudent: true }))
              }
            >
              <h2 className="text-xl font-semibold text-themecolor-900 font-display">
                Add Student
              </h2>
              <p className="text-themecolor-120 font-sans">
                Click to add a new student
              </p>
            </div>
            <div
              className="bg-themecolor-50 p-6 rounded-2xl shadow-soft cursor-pointer hover:bg-themecolor-200 transition-colors"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addTeacher: true }))
              }
            >
              <h2 className="text-xl font-semibold text-themecolor-900 font-display">
                Add Trainer
              </h2>
              <p className="text-themecolor-120 font-sans">
                Click to add a new trainer
              </p>
            </div>
            <div
              className="bg-themecolor-50 p-6 rounded-2xl shadow-soft cursor-pointer hover:bg-themecolor-200 transition-colors"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addDepartment: true }))
              }
            >
              {/* added batch here  */}
              <h2 className="text-xl font-semibold text-themecolor-900 font-display">
                Add Batch
              </h2>
              <p className="text-themecolor-120 font-sans">
                Click to add a new batch
              </p>
            </div>
            <div
              className="bg-themecolor-50 p-6 rounded-2xl shadow-soft cursor-pointer hover:bg-themecolor-200 transition-colors"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addSubject: true }))
              }
            >
              <h2 className="text-xl font-semibold text-themecolor-900 font-display">
                Add Subject
              </h2>
              <p className="text-themecolor-120 font-sans">
                Click to add a new subject
              </p>
            </div>
            <div
              className="bg-themecolor-50 p-6 rounded-2xl shadow-soft cursor-pointer hover:bg-themecolor-200 transition-colors"
              onClick={() =>
                setModalState((prev) => ({ ...prev, addMarks: true }))
              }
            >
              <h2 className="text-xl font-semibold text-themecolor-900 font-display">
                Add Marks
              </h2>
              <p className="text-themecolor-120 font-sans">
                Click to add student marks
              </p>
            </div>
          </div>

          {/* Modals */}
          <AddStudentModel
            modalState={modalState.addStudent}
            setValidationError={setValidationError}
            setSuccessMessage={setSuccessMessage}
            setModalState={setModalState}
          />

          <Modal
            isOpen={modalState.addTeacher}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addTeacher: false }))
            }
            title="Add Trainer"
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
                  className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
                />
                {emailValidationMessage.teacher && (
                  <p className="text-red-500 mt-1 text-sm font-sans">
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
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <input
                type="text"
                placeholder="Name"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <button
                type="submit"
                disabled={loading || emailValidationMessage.teacher !== ""}
                className="w-full px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition-colors disabled:bg-themecolor-300 disabled:cursor-not-allowed font-sans"
              >
                Add Trainer
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={modalState.addDepartment}
            onClose={() =>
              setModalState((prev) => ({ ...prev, addDepartment: false }))
            }
            title="Add Batch"
          >
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <input
                type="text"
                placeholder="Batch Name"
                value={newDepartment.name}
                onChange={(e) =>
                  setNewDepartment({ ...newDepartment, name: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition-colors disabled:bg-themecolor-300 disabled:cursor-not-allowed font-sans"
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
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <select
                value={newSubject.departmentId}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, departmentId: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
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
                className="w-full px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition-colors disabled:bg-themecolor-300 disabled:cursor-not-allowed font-sans"
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
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
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
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
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
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <input
                type="number"
                placeholder="Marks"
                value={newMarks.marks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, marks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={newMarks.totalMarks}
                onChange={(e) =>
                  setNewMarks({ ...newMarks, totalMarks: e.target.value })
                }
                required
                className="w-full p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-themecolor-600 text-themecolor-50 rounded-3xl shadow-soft hover:bg-themecolor-700 transition-colors disabled:bg-themecolor-300 disabled:cursor-not-allowed font-sans"
              >
                Add Marks
              </button>
            </form>
          </Modal>

          {/* Assign Teacher to Subject */}
          <div className="bg-themecolor-50 p-6 rounded-2xl shadow-soft mb-14">
            <h2 className="text-xl font-semibold text-themecolor-900 mb-4 font-display">
              Assign Trainer to Subject
            </h2>
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="flex items-center justify-between p-3 border-b border-themecolor-400"
              >
                <p className="text-themecolor-120 font-sans">
                  {subject.name} -{" "}
                  {subject.departmentId?.name || "No Department"}
                </p>
                <select
                  value={subject.teacherId?._id || ""}
                  onChange={(e) =>
                    handleAssignTeacher(subject._id, e.target.value)
                  }
                  className="p-2 border-2 border-themecolor-500 rounded-3xl focus:outline-none focus:ring-2 focus:ring-themecolor-600 text-themecolor-120 font-sans"
                >
                  <option value="">Select Trainer</option>
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
          {/* <div className="bg-themecolor-50 p-6 rounded-2xl shadow-soft mb-14">
            <h2 className="text-xl font-semibold text-themecolor-900 mb-4 font-display">
              Students List
            </h2>
            <ul className="space-y-2">
              {students.map((student) => (
                <li
                  key={student._id}
                  className="p-3 border-b border-themecolor-400 text-themecolor-120 font-sans"
                >
                  {student.name} ({student.studentId}) - Email:{" "}
                  {student.userId?.email || "N/A"} - Department:{" "}
                  {student.department?.name || "Not Assigned"}
                </li>
              ))}
            </ul>
          </div> */}

          {/* Teachers List */}
          {/* <div className="bg-themecolor-50 p-6 rounded-2xl shadow-soft">
            <h2 className="text-xl font-semibold text-themecolor-900 mb-4 font-display">
              Teachers List
            </h2>
            <ul className="space-y-2">
              {teachers.map((teacher) => (
                <li
                  key={teacher._id}
                  className="p-3 border-b border-themecolor-400 text-themecolor-120 font-sans"
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
