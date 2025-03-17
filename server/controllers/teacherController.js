const Marks = require("../models/Marks");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Student = require("../models/Student");

const getAssignedSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).populate(
      "assignedSubjects"
    );
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Deduplicate assignedSubjects by _id
    const uniqueSubjects = Array.from(
      new Map(
        teacher.assignedSubjects.map((subject) => [
          subject._id.toString(),
          subject,
        ])
      ).values()
    );

    // Log for debugging
    console.log(
      "Teacher's assigned subjects:",
      uniqueSubjects.map((s) => ({ _id: s._id, name: s.name }))
    );

    res.json(uniqueSubjects);
  } catch (error) {
    console.error("getAssignedSubjects error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getStudentsForSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.teacherId.toString() !== teacher._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this subject" });
    }

    // Fetch students enrolled in this subject
    const students = await Student.find({ enrolledSubjects: subjectId }).select(
      "name studentId"
    );
    res.json(students);
  } catch (error) {
    console.error("getStudentsForSubject error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addMarks = async (req, res) => {
  try {
    const { studentId, subjectId, testDate, marks, totalMarks } = req.body;

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.teacherId.toString() !== teacher._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add marks for this subject" });
    }

    const mark = new Marks({
      studentId,
      subjectId,
      testDate,
      marks,
      totalMarks,
    });
    await mark.save();

    res.status(201).json(mark);
  } catch (error) {
    console.error("addMarks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAssignedSubjects, getStudentsForSubject, addMarks };
