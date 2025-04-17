import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "./modal";
import { fetchUsers, addStudent } from "../../redux/slices/adminSlice";

const AddStudentModel = (props) => {
  const { modalState, setModalState, setValidationError, setSuccessMessage } =
    props;
  const dispatch = useDispatch();
  const { students, departments, users, loading } = useSelector(
    (state) => state.admin
  );
  const [newStudent, setNewStudent] = useState({
    email: "",
    password: "",
    name: "",
    department: "",
    studentId: "",
  });
  const [emailValidationMessage, setEmailValidationMessage] = useState("");
  const [show, setShow] = useState(false);

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

  useEffect(() => {
    setShow(modalState);
  }, [modalState]);

  return (
    <Modal
      isOpen={show}
      onClose={() => {
        setModalState((prev) => ({ ...prev, addStudent: false }));
        setShow(false);
      }}
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
                  (user) => user.email?.toLowerCase() === email.toLowerCase()
                );
                setEmailValidationMessage((prev) =>
                  emailExists ? "This email is already in use." : ""
                );
              } else {
                setEmailValidationMessage((prev) => "");
              }
            }}
            required
            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
          />
          {emailValidationMessage && (
            <p className="text-red-500 mt-1 text-sm">
              {emailValidationMessage}
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
          disabled={loading || emailValidationMessage !== ""}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Student
        </button>
      </form>
    </Modal>
  );
};

export default AddStudentModel;
