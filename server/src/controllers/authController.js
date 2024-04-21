const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const multer = require("multer");

exports.signup = async (req, res) => {
  try {
    const { fullName, username, password, isgoogle } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser && !isgoogle) {
      return res.status(400).json({ message: "Username already exists" });
    }
    console.log({ existingUser });
    console.log({ isgoogle });
    if (existingUser && isgoogle) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        { username },
        { fullName, password: hashedPassword }
      );
      res.status(201).json({
        message: "User created successfully",
        username: username,
        password,
      });
    }
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ fullName, username, password: hashedPassword });
      await user.save();
      res.status(201).json({
        message: "User created successfully",
        username: user.username,
        password,
      });
    }
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      "your-secret-key",
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ _id: user._id }, { password: hashedNewPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

exports.changeProfilePic = async (req, res) => {
  try {
    console.log(req.file);
    const { userId } = req.params;
    const profilePicture = req.file.path;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's profile picture
    user.profilePicture = profilePicture;
    await user.save();

    res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.error("Error changing profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UserID in getProfilePicture",userId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.profilePicture) {
      return res
        .status(404)
        .json({ message: "Profile picture not found for this user" });
    }

    res.status(200).json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
