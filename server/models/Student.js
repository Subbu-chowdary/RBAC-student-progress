const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  reg_no: { type: String, required: true },
  college: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String, required: true },
  cgpa: { type: String, required: true },
  resume_file: { type: String, required: true },  
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  enrolledSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
});

module.exports = mongoose.model("Student", studentSchema);
