const mongoose = require("mongoose");
const Student = require("../models/Student");
const Marks = require("../models/Marks");

const getMarks = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const marks = await Marks.find({ studentId: student._id })
      .populate("subjectId", "name")
      .populate("studentId", "name");
    res.json(marks);
  } catch (error) {
    console.error("getMarks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const marks = await Marks.find({
      studentId: student._id,
      testDate: { $gte: oneWeekAgo },
    })
      .populate("subjectId", "name")
      .populate("studentId", "name");
    res.json(marks);
  } catch (error) {
    console.error("getWeeklyReport error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMarks, getWeeklyReport };
