const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ["admin", "teacher", "student"], required: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
