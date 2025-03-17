import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  fetchTeachers,
  fetchSubjects,
  fetchDepartments,
  addStudent,
  addTeacher,
  addDepartment,
  addSubject,
  assignTeacherToSubject,
  addMarks,
} from "../redux/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { students, teachers, subjects, departments, loading, error } =
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

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addStudent(newStudent)).unwrap();
      setNewStudent({
        email: "",
        password: "",
        name: "",
        department: "",
        studentId: "",
      });
    } catch (err) {
      console.error("Failed to add student:", err);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addTeacher(newTeacher)).unwrap();
      setNewTeacher({ email: "", password: "", name: "" });
    } catch (err) {
      console.error("Failed to add teacher:", err);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addDepartment(newDepartment)).unwrap();
      setNewDepartment({ name: "" });
    } catch (err) {
      console.error("Failed to add department:", err);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addSubject(newSubject)).unwrap();
      setNewSubject({ name: "", departmentId: "" });
    } catch (err) {
      console.error("Failed to add subject:", err);
    }
  };

  const handleAssignTeacher = (subjectId, teacherId) => {
    if (teacherId) {
      dispatch(assignTeacherToSubject({ subjectId, teacherId }));
    }
  };

  const handleAddMarks = async (e) => {
    e.preventDefault();
    try {
      // Add marks and enroll student in the subject
      await dispatch(addMarks({ ...newMarks, enroll: true })).unwrap();
      setNewMarks({
        studentId: "",
        subjectId: "",
        testDate: "",
        marks: "",
        totalMarks: "",
      });
    } catch (err) {
      console.error("Failed to add marks or enroll student:", err);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <h2>Add Student</h2>
      <form onSubmit={handleAddStudent}>
        <input
          type="email"
          placeholder="Email"
          value={newStudent.email}
          onChange={(e) =>
            setNewStudent({ ...newStudent, email: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newStudent.password}
          onChange={(e) =>
            setNewStudent({ ...newStudent, password: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={newStudent.name}
          onChange={(e) =>
            setNewStudent({ ...newStudent, name: e.target.value })
          }
          required
        />
        <select
          value={newStudent.department}
          onChange={(e) =>
            setNewStudent({ ...newStudent, department: e.target.value })
          }
          required
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
        />
        <button type="submit" disabled={loading}>
          Add Student
        </button>
      </form>

      <h2>Add Teacher</h2>
      <form onSubmit={handleAddTeacher}>
        <input
          type="email"
          placeholder="Email"
          value={newTeacher.email}
          onChange={(e) =>
            setNewTeacher({ ...newTeacher, email: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newTeacher.password}
          onChange={(e) =>
            setNewTeacher({ ...newTeacher, password: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Name"
          value={newTeacher.name}
          onChange={(e) =>
            setNewTeacher({ ...newTeacher, name: e.target.value })
          }
          required
        />
        <button type="submit" disabled={loading}>
          Add Teacher
        </button>
      </form>

      <h2>Add Department</h2>
      <form onSubmit={handleAddDepartment}>
        <input
          type="text"
          placeholder="Department Name"
          value={newDepartment.name}
          onChange={(e) =>
            setNewDepartment({ ...newDepartment, name: e.target.value })
          }
          required
        />
        <button type="submit" disabled={loading}>
          Add Department
        </button>
      </form>

      <h2>Add Subject</h2>
      <form onSubmit={handleAddSubject}>
        <input
          type="text"
          placeholder="Subject Name"
          value={newSubject.name}
          onChange={(e) =>
            setNewSubject({ ...newSubject, name: e.target.value })
          }
          required
        />
        <select
          value={newSubject.departmentId}
          onChange={(e) =>
            setNewSubject({ ...newSubject, departmentId: e.target.value })
          }
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          Add Subject
        </button>
      </form>

      <h2>Assign Teacher to Subject</h2>
      {subjects.map((subject) => (
        <div key={subject._id}>
          <p>
            {subject.name} - {subject.departmentId?.name || "No Department"}
          </p>
          <select
            value={subject.teacherId?._id || ""}
            onChange={(e) => handleAssignTeacher(subject._id, e.target.value)}
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

      <h2>Add Marks</h2>
      <form onSubmit={handleAddMarks}>
        <select
          value={newMarks.studentId}
          onChange={(e) =>
            setNewMarks({ ...newMarks, studentId: e.target.value })
          }
          required
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
        />
        <input
          type="number"
          placeholder="Marks"
          value={newMarks.marks}
          onChange={(e) => setNewMarks({ ...newMarks, marks: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Total Marks"
          value={newMarks.totalMarks}
          onChange={(e) =>
            setNewMarks({ ...newMarks, totalMarks: e.target.value })
          }
          required
        />
        <button type="submit" disabled={loading}>
          Add Marks
        </button>
      </form>

      <h2>Students List</h2>
      <ul>
        {students.map((student) => (
          <li key={student._id}>
            {student.name} ({student.studentId}) - Department:{" "}
            {student.department?.name || "Not Assigned"}
          </li>
        ))}
      </ul>

      <h2>Teachers List</h2>
      <ul>
        {teachers.map((teacher) => (
          <li key={teacher._id}>{teacher.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
