const Student = require("../models/Student");

const generateStudentId = async () => {
  const count = await Student.countDocuments();
  return `NGC-${String(count + 1).padStart(5, "0")}`; // e.g., SID00001 NGC-
};

module.exports = { generateStudentId };
