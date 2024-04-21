const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, unique: true },
  password: String,
  profilePicture: String,
});

module.exports = mongoose.model("User", userSchema);
