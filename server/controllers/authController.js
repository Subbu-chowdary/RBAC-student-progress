const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!["admin", "teacher", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const lowerCaseEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: lowerCaseEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    const { identifier, password } = req.body;
    const lowerCaseIdentifier = identifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: lowerCaseIdentifier }, { name: lowerCaseIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only send over HTTPS in prod
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: accessToken,
      refreshToken:refreshToken,
      role: user.role,
      name: user.name
    });

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
