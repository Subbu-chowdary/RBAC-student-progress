// college-portal/server/controllers/studentController.js
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
    // Find the student
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get the number of days to look back (default to 7 if not specified)
    const days = parseInt(req.query.days) || 7;
    if (days < 1 || days > 7) {
      return res.status(400).json({ message: "Days must be between 1 and 7" });
    }

    // Calculate the start date based on the number of days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0); // Start of the day

    // Calculate the end date (today)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of the day

    // Fetch marks within the date range
    const marks = await Marks.find({
      studentId: student._id,
      testDate: { $gte: startDate, $lte: endDate },
    })
      .populate("subjectId", "name")
      .populate("studentId", "name");

    // If no marks are found, try reducing the number of days incrementally
    let adjustedMarks = marks;
    let adjustedDays = days;
    if (marks.length === 0) {
      for (let d = days - 1; d >= 1; d--) {
        const tempStartDate = new Date();
        tempStartDate.setDate(tempStartDate.getDate() - d);
        tempStartDate.setHours(0, 0, 0, 0);

        adjustedMarks = await Marks.find({
          studentId: student._id,
          testDate: { $gte: tempStartDate, $lte: endDate },
        })
          .populate("subjectId", "name")
          .populate("studentId", "name");

        if (adjustedMarks.length > 0) {
          adjustedDays = d;
          break;
        }
      }
    }

    // If still no marks are found, return an empty report with a message
    if (adjustedMarks.length === 0) {
      return res.json({
        message: `No marks found for the last ${days} days`,
        daysSearched: days,
        marks: [],
        averages: {},
      });
    }

    // Group marks by subject and calculate averages
    const averages = {};
    adjustedMarks.forEach((mark) => {
      const subjectId = mark.subjectId._id.toString();
      const subjectName = mark.subjectId.name;

      if (!averages[subjectId]) {
        averages[subjectId] = {
          subjectName,
          totalMarks: 0,
          totalPossible: 0,
          count: 0,
        };
      }

      averages[subjectId].totalMarks += mark.marks;
      averages[subjectId].totalPossible += mark.totalMarks;
      averages[subjectId].count += 1;
    });

    // Calculate the average percentage for each subject
    Object.keys(averages).forEach((subjectId) => {
      const subject = averages[subjectId];
      const averageMarks = subject.totalMarks / subject.count;
      const averageTotal = subject.totalPossible / subject.count;
      const percentage = (averageMarks / averageTotal) * 100;
      averages[subjectId] = {
        subjectName: subject.subjectName,
        averageMarks: parseFloat(averageMarks.toFixed(2)),
        averageTotal: parseFloat(averageTotal.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    // Return the marks and averages
    res.json({
      message: `Marks found for the last ${adjustedDays} days`,
      daysSearched: adjustedDays,
      marks: adjustedMarks,
      averages,
    });
  } catch (error) {
    console.error("getWeeklyReport error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMarks, getWeeklyReport };
