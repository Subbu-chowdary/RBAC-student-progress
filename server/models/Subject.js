const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }, // Assigned by admin
});

module.exports = mongoose.model("Subject", subjectSchema);
