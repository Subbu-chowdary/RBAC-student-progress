const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  getAssignedSubjects,
  getStudentsForSubject,
  addMarks,
} = require("../controllers/teacherController");

router.use(auth);
router.use(role("teacher"));

router.get("/subjects", getAssignedSubjects);
router.get("/subjects/:subjectId/students", getStudentsForSubject); // New route
router.post("/marks", addMarks);

module.exports = router;
