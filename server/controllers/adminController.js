const mongoose = require("mongoose");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Department = require("../models/Department");
const Marks = require("../models/Marks");
const User = require("../models/User");
const { generateStudentId } = require("../utils/generateStudentId");
const bcrypt = require("bcryptjs");

const addStudent = async (req, res) => {
  try {
    const { email, password, name, department, studentId } = req.body;
    if (!email || !password || !name || !department) {
      return res.status(400).json({
        message: "Email, password, name, and department are required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({ message: "Department not found" });
    }
    let user = await User.findOne({ email });
    if (user && user.role !== "student") {
      return res.status(400).json({
        message: "Email is already associated with a different role",
      });
    }
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        email,
        password: hashedPassword,
        role: "student",
        name,
      });
      await user.save();
    }
    const finalStudentId = studentId || (await generateStudentId());
    const student = new Student({
      userId: user._id,
      studentId: finalStudentId,
      name,
      department,
    });
    await student.save();
    const populatedStudent = await Student.findById(student._id)
      .populate("department", "name")
      .populate("enrolledSubjects", "name");
    res.status(201).json({
      message: "Student added successfully",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("addStudent error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("enrolledSubjects", "name")
      .populate("department", "name");
    res.json(students);
  } catch (error) {
    console.error("getAllStudents error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password, and name are required",
      });
    }
    let user = await User.findOne({ email });
    if (user && user.role !== "teacher") {
      return res.status(400).json({
        message: "Email is already associated with a different role",
      });
    }
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        email,
        password: hashedPassword,
        role: "teacher",
        name,
      });
      await user.save();
    }
    const teacher = new Teacher({ userId: user._id, name });
    await teacher.save();
    const populatedTeacher = await Teacher.findById(teacher._id).populate(
      "assignedSubjects",
      "name"
    );
    res.status(201).json({
      message: "Teacher added successfully",
      teacher: populatedTeacher,
    });
  } catch (error) {
    console.error("addTeacher error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({
        message: "Department with this name already exists",
      });
    }
    const department = new Department({ name });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    console.error("addDepartment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSubject = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    if (!name || !departmentId) {
      return res
        .status(400)
        .json({ message: "Name and departmentId are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(400).json({ message: "Department not found" });
    }
    const existingSubject = await Subject.findOne({ name, departmentId });
    if (existingSubject) {
      return res.status(400).json({
        message: "Subject with this name already exists in the department",
      });
    }
    const subject = new Subject({ name, departmentId });
    await subject.save();
    await Department.findByIdAndUpdate(departmentId, {
      $addToSet: { subjects: subject._id }, // Use $addToSet to prevent duplicates
    });
    const populatedSubject = await Subject.findById(subject._id).populate(
      "departmentId",
      "name"
    );
    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error("addSubject error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const assignTeacherToSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { teacherId } = req.body;
    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid subjectId or teacherId" });
    }
    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { teacherId },
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    await Teacher.findByIdAndUpdate(teacherId, {
      $addToSet: { assignedSubjects: subjectId }, // Use $addToSet to prevent duplicates
    });
    const populatedSubject = await Subject.findById(subject._id)
      .populate("departmentId", "name")
      .populate("teacherId", "name");
    res.json(populatedSubject);
  } catch (error) {
    console.error("assignTeacherToSubject error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addMarks = async (req, res) => {
  try {
    const { studentId, subjectId, testDate, marks, totalMarks, enroll } =
      req.body;
    if (!studentId || !subjectId || !testDate || !marks || !totalMarks) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(subjectId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid studentId or subjectId" });
    }
    const student = await Student.findById(studentId);
    const subject = await Subject.findById(subjectId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    if (marks < 0 || totalMarks <= 0) {
      return res
        .status(400)
        .json({ message: "Marks and totalMarks must be valid" });
    }

    // Add marks
    const mark = new Marks({
      studentId,
      subjectId,
      testDate,
      marks,
      totalMarks,
    });
    await mark.save();

    // Enroll student in the subject if enroll flag is true
    if (enroll) {
      await Student.findByIdAndUpdate(
        studentId,
        { $addToSet: { enrolledSubjects: subjectId } }, // $addToSet prevents duplicates
        { new: true }
      );
    }

    const populatedMark = await Marks.findById(mark._id)
      .populate("studentId", "name")
      .populate("subjectId", "name");
    res.status(201).json(populatedMark);
  } catch (error) {
    console.error("addMarks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("assignedSubjects", "name");
    res.json(teachers);
  } catch (error) {
    console.error("getAllTeachers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("departmentId", "name")
      .populate("teacherId", "name");
    res.json(subjects);
  } catch (error) {
    console.error("getAllSubjects error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate("subjects", "name");
    res.json(departments);
  } catch (error) {
    console.error("getAllDepartments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addStudent,
  addTeacher,
  addDepartment,
  addSubject,
  assignTeacherToSubject,
  addMarks,
  getAllStudents,
  getAllTeachers,
  getAllSubjects,
  getAllDepartments,
};
