// college-portal/server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Validate role
    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Convert email to lowercase for consistency
    const lowerCaseEmail = email.toLowerCase();

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with lowercase email
    const user = new User({
      email: lowerCaseEmail,
      password: hashedPassword,
      role,
      name,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Changed from email to identifier

    // Convert identifier to lowercase for consistency
    const lowerCaseIdentifier = identifier.toLowerCase();

    // Find user by either email or name (case-insensitive)
    const user = await User.findOne({
      $or: [{ email: lowerCaseIdentifier }, { name: lowerCaseIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ name: user.name, role: user.role });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { register, login, getMe };
