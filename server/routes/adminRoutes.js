const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  addStudent,
  addTeacher,
  addDepartment,
  addSubject,
  assignTeacherToSubject,
  addMarks,
  getAllStudents,
  getAllTeachers,
  getAllSubjects,
  getAllDepartments,
} = require("../controllers/adminController");

router.use(auth);
router.use(role("admin"));

router.post("/students", addStudent);
router.post("/teachers", addTeacher);
router.post("/departments", addDepartment);
router.post("/subjects", addSubject);
router.put("/subjects/:subjectId/assign-teacher", assignTeacherToSubject);
router.post("/marks", addMarks);
router.get("/students", getAllStudents);
router.get("/teachers", getAllTeachers);
router.get("/subjects", getAllSubjects);
router.get("/departments", getAllDepartments);

module.exports = router;
