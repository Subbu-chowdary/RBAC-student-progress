// college-portal/server/controllers/adminController.js
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const Department = require("../models/Department");
const Marks = require("../models/Marks");
const User = require("../models/User");
const { generateStudentId } = require("../utils/generateStudentId");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const fs = require("fs");

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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
      name,
    });
    await newUser.save();

    const finalStudentId = studentId || (await generateStudentId());
    const student = new Student({
      userId: newUser._id,
      studentId: finalStudentId,
      name,
      department,
    });
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("department", "name")
      .populate("enrolledSubjects", "name")
      .populate("userId", "email name");
    res.status(201).json({
      message: "Student added successfully",
      student: populatedStudent,
    });
  } catch (error) {
    console.error("addStudent error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("enrolledSubjects", "name")
      .populate("department", "name")
      .populate("userId", "email name");

    // Fetch marks for each student
    const studentsWithMarks = await Promise.all(
      students.map(async (student) => {
        const marks = await Marks.find({ studentId: student._id })
          .populate("subjectId", "name")
          .lean();
        return {
          ...student.toObject(),
          marks,
        };
      })
    );

    res.json(studentsWithMarks);
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "teacher",
      name,
    });
    await newUser.save();

    const teacher = new Teacher({ userId: newUser._id, name });
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
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }
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
      $addToSet: { subjects: subject._id },
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
      $addToSet: { assignedSubjects: subjectId },
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

    const mark = new Marks({
      studentId,
      subjectId,
      testDate,
      marks,
      totalMarks,
    });
    await mark.save();

    if (enroll) {
      await Student.findByIdAndUpdate(
        studentId,
        { $addToSet: { enrolledSubjects: subjectId } },
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
    const teachers = await Teacher.find()
      .populate("userId", "email")
      .populate("assignedSubjects", "name");
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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const uploadExcelData = async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File saved at:", req.file.path);
    const workbook = XLSX.readFile(req.file.path);
    console.log("Sheet names:", workbook.SheetNames);

    // Use the first sheet if "StudentMarks" is not found
    const sheetName = workbook.SheetNames.includes("StudentMarks")
      ? "StudentMarks"
      : workbook.SheetNames[0];
    if (!sheetName) {
      console.log("No sheets found in the Excel file");
      return res
        .status(400)
        .json({ message: "No sheets found in the Excel file" });
    }

    // Parse the sheet with header: 1 to use the first row as headers
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1, // Use the first row as headers
      defval: null,
      raw: false, // Convert dates to strings
    });

    // The first row should be the headers
    if (sheet.length === 0) {
      console.log(`No data found in sheet: ${sheetName}`);
      return res
        .status(400)
        .json({ message: `No valid data found in sheet: ${sheetName}` });
    }

    // Extract headers from the first row
    const headers = sheet[0];
    console.log("Headers:", headers);

    // Convert remaining rows to objects using the headers
    const data = sheet.slice(1).map((row) => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });

    console.log("Parsed data from Excel sheet:", data);

    if (data.length === 0) {
      console.log(`No data rows found in sheet: ${sheetName}`);
      return res
        .status(400)
        .json({ message: `No data rows found in sheet: ${sheetName}` });
    }

    let processedRows = 0;
    let failedRows = 0;

    for (const row of data) {
      const {
        studentId,
        name,
        email,
        password,
        departmentName,
        enrolledSubjects,
        subjectName,
        testDate,
        marks,
        totalMarks,
      } = row;
      console.log("Processing row:", { studentId, name, email, subjectName });

      // Validate required fields for student creation
      if (!studentId || !name || !email || !password || !departmentName) {
        console.log(
          `Skipping row due to missing required fields: ${JSON.stringify(row)}`
        );
        failedRows++;
        continue;
      }

      // Handle student creation or lookup
      let student = await Student.findOne({ studentId });
      if (!student) {
        // Find or create department
        let department = await Department.findOne({ name: departmentName });
        if (!department) {
          department = new Department({ name: departmentName, subjects: [] });
          await department.save();
          console.log(
            "Created department:",
            department.name,
            "ID:",
            department._id
          );
        } else {
          console.log(
            "Found department:",
            department.name,
            "ID:",
            department._id
          );
        }

        // Create user
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = new User({
              email: email.toLowerCase(),
              password: hashedPassword,
              role: "student",
              name,
            });
            await user.save();
            console.log("Created user:", user.email, "ID:", user._id);
          } catch (error) {
            console.log(`Failed to create user ${email}: ${error.message}`);
            failedRows++;
            continue;
          }
        } else {
          console.log("Found existing user:", user.email, "ID:", user._id);
        }

        // Find or create subjects
        const subjectNames = enrolledSubjects
          ? enrolledSubjects.split(",").map((s) => s.trim())
          : [];
        const subjectIds = [];
        for (const subjName of subjectNames) {
          if (!subjName) continue; // Skip empty subject names
          let subject = await Subject.findOne({
            name: subjName,
            departmentId: department._id,
          });
          if (!subject) {
            try {
              subject = new Subject({
                name: subjName,
                departmentId: department._id,
              });
              await subject.save();
              department.subjects.push(subject._id);
              await department.save();
              console.log("Created subject:", subject.name, "ID:", subject._id);
            } catch (error) {
              console.log(
                `Failed to create subject ${subjName}: ${error.message}`
              );
              continue;
            }
          } else {
            console.log("Found subject:", subject.name, "ID:", subject._id);
          }
          subjectIds.push(subject._id);
        }

        // Create student
        try {
          student = new Student({
            userId: user._id,
            studentId,
            name,
            department: department._id,
            enrolledSubjects: subjectIds,
          });
          await student.save();
          console.log(
            "Created student:",
            student.studentId,
            "ID:",
            student._id
          );
        } catch (error) {
          console.log(
            `Failed to create student ${studentId}: ${error.message}`
          );
          failedRows++;
          continue;
        }
      } else {
        console.log(
          "Found existing student:",
          student.studentId,
          "ID:",
          student._id
        );
      }

      // Handle marks creation (if subjectName, testDate, etc., are present)
      if (
        subjectName &&
        testDate &&
        marks !== undefined &&
        totalMarks !== undefined
      ) {
        if (!student) {
          console.log(
            `Student not found or not created for marks: ${studentId}`
          );
          failedRows++;
          continue;
        }

        const subject = await Subject.findOne({ name: subjectName });
        if (!subject) {
          console.log(`Subject not found for marks: ${subjectName}`);
          failedRows++;
          continue;
        } else {
          console.log(
            "Found subject for marks:",
            subject.name,
            "ID:",
            subject._id
          );
        }

        // Parse testDate (handle various formats)
        let parsedTestDate;
        if (typeof testDate === "string") {
          parsedTestDate = new Date(testDate);
          if (isNaN(parsedTestDate.getTime())) {
            parsedTestDate = XLSX.SSF.parse_date_code(Number(testDate));
            if (parsedTestDate) {
              parsedTestDate = new Date(
                parsedTestDate.y,
                parsedTestDate.m - 1,
                parsedTestDate.d
              );
            }
          }
        } else if (typeof testDate === "number") {
          parsedTestDate = XLSX.SSF.parse_date_code(testDate);
          if (parsedTestDate) {
            parsedTestDate = new Date(
              parsedTestDate.y,
              parsedTestDate.m - 1,
              parsedTestDate.d
            );
          }
        } else {
          parsedTestDate = new Date(testDate);
        }

        if (!parsedTestDate || isNaN(parsedTestDate.getTime())) {
          console.log(
            `Invalid testDate for student ${studentId} in ${subjectName}: ${testDate}`
          );
          failedRows++;
          continue;
        }

        // Validate marks and totalMarks
        const marksNum = Number(marks);
        const totalMarksNum = Number(totalMarks);
        if (
          isNaN(marksNum) ||
          isNaN(totalMarksNum) ||
          marksNum < 0 ||
          totalMarksNum <= 0
        ) {
          console.log(
            `Invalid marks or totalMarks for student ${studentId} in ${subjectName}: marks=${marks}, totalMarks=${totalMarks}`
          );
          failedRows++;
          continue;
        }

        try {
          const mark = new Marks({
            studentId: student._id,
            subjectId: subject._id,
            testDate: parsedTestDate,
            marks: marksNum,
            totalMarks: totalMarksNum,
          });
          await mark.save();
          console.log(
            `Created mark for student ${studentId} in ${subjectName}`
          );
          processedRows++;
        } catch (error) {
          console.log(
            `Failed to create mark for ${studentId} in ${subjectName}: ${error.message}`
          );
          failedRows++;
        }
      } else {
        console.log(
          `Skipping marks creation for ${studentId}: missing required fields`
        );
        processedRows++;
      }
    }

    fs.unlinkSync(req.file.path);
    console.log("Deleted uploaded file:", req.file.path);

    res.status(200).json({
      message: `Data uploaded successfully. Processed ${processedRows} rows, failed ${failedRows} rows.`,
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("Deleted uploaded file on error:", req.file.path);
    }
    res
      .status(500)
      .json({ message: "Error processing Excel file", error: error.message });
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
  getAllUsers,
  uploadExcelData,
};
