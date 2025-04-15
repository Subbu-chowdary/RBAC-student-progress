const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");  // <-- Add this!
const connectDB = require("./config/db");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const usersRoutes = require("./routes/alluserRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Middleware
app.use(cors({
  origin:true,  // Replace with your frontend URL
  credentials: true                // Allow cookies to be sent!
}));

app.use(express.json());
app.use(cookieParser());            // <-- Add this after express.json()

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/users", usersRoutes); 

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
