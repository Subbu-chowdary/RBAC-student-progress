// college-portal/server/controllers/usersController.js
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Department = require("../models/Department");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const user = await User.findById(userId).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = { name: user.name, email: user.email, role: user.role };

    // Role-specific data
    if (user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId })
        .populate("assignedSubjects", "name")
        .populate("userId", "email name"); // Include userId population for consistency
      if (teacher) {
        profileData.assignedSubjects = teacher.assignedSubjects || [];
        profileData.teacherId = teacher._id; // Optional: Include teacher-specific ID
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId })
        .populate("department", "name")
        .populate("enrolledSubjects", "name")
        .populate("userId", "email name"); // Include userId population
      if (student) {
        profileData.department = student.department || null;
        profileData.enrolledSubjects = student.enrolledSubjects || [];
        profileData.studentId = student.studentId; // Include student-specific ID
      }
    }

    res.json(profileData);
  } catch (error) {
    console.error("getUserProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Optional: Add a function to fetch all users (if needed for admin purposes)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers, // Optional, included from adminController.js
};
