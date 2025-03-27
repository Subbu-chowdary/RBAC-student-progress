// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { uploadExcelData } = require("../controllers/adminController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth"); // Import auth middleware
const role = require("../middleware/role"); // Import role middleware
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
  getAllUsers,
} = require("../controllers/adminController");

// Apply auth and role middleware to all routes
router.use(auth); // Ensure user is authenticated
router.use(role("admin")); // Restrict to admin role

// Admin routes
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
router.get("/users", getAllUsers); // Note: This overwrites the previous /users route; fix if needed
router.post("/upload-excel", upload.single("excelFile"), uploadExcelData);

module.exports = router;
