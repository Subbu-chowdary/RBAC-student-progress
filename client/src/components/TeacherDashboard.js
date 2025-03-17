import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssignedSubjects,
  fetchStudentsForSubject,
  addMarks,
} from "../redux/slices/teacherSlice";

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const { subjects, studentsForSubject, loading, error } = useSelector(
    (state) => state.teacher
  );
  const [newMarks, setNewMarks] = useState({
    studentId: "",
    subjectId: "",
    testDate: "",
    marks: "",
    totalMarks: "",
  });

  useEffect(() => {
    dispatch(fetchAssignedSubjects());
  }, [dispatch]);

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setNewMarks({ ...newMarks, subjectId, studentId: "" });
    if (subjectId) {
      dispatch(fetchStudentsForSubject(subjectId));
    }
  };

  const handleAddMarks = (e) => {
    e.preventDefault();
    dispatch(addMarks(newMarks));
    setNewMarks({
      studentId: "",
      subjectId: "",
      testDate: "",
      marks: "",
      totalMarks: "",
    });
  };

  // Deduplicate subjects based on _id
  const uniqueSubjects = Array.from(
    new Map(subjects.map((subject) => [subject._id, subject])).values()
  );

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Your Subjects</h2>
      <ul>
        {uniqueSubjects.map((subject) => (
          <li key={subject._id}>{subject.name}</li>
        ))}
      </ul>

      <h2>Add Marks</h2>
      <form onSubmit={handleAddMarks}>
        <select
          value={newMarks.subjectId}
          onChange={handleSubjectChange}
          required
        >
          <option value="">Select Subject</option>
          {uniqueSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={newMarks.studentId}
          onChange={(e) =>
            setNewMarks({ ...newMarks, studentId: e.target.value })
          }
          required
          disabled={!newMarks.subjectId || studentsForSubject.length === 0}
        >
          <option value="">Select Student</option>
          {studentsForSubject.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name} ({student.studentId})
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
    </div>
  );
};

export default TeacherDashboard;
