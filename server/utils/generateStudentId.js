const Student = require("../models/Student");

const generateStudentId = async () => {
  const count = await Student.countDocuments();
  return `SID${String(count + 1).padStart(5, "0")}`; // e.g., SID00001
};

module.exports = { generateStudentId };
