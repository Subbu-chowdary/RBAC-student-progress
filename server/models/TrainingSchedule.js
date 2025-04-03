const mongoose = require("mongoose");

const trainingScheduleSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  classDates: {
    type: [Date], // Array of dates representing specific class occurrences
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

module.exports = mongoose.model("TrainingSchedule", trainingScheduleSchema);
