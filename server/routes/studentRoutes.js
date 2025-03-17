const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  getMarks,
  getWeeklyReport,
} = require("../controllers/studentController");

router.use(auth);
router.use(role("student"));

router.get("/marks", getMarks);
router.get("/weekly-report", getWeeklyReport);

module.exports = router;
