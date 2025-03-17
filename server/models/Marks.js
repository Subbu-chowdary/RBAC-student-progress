const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  testDate: { type: Date, required: true }, // Date of the test
  marks: { type: Number, required: true }, // Marks scored
  totalMarks: { type: Number, required: true }, // Total marks for the test
});

module.exports = mongoose.model("Marks", marksSchema);
