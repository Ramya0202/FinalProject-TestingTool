const express = require("express");
const path = require("path");
const authController = require("../controllers/authController");

const router = express.Router();

router.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  next();
});

router.use(
  "/profile-pictures",
  express.static(path.join(__dirname, "uploads"))
);
// console.log(path.join(__dirname, "uploads"));

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.put("/change-password", authController.changePassword);
router.post(
  "/upload-profile-picture/:userId",
  authController.upload.single("profilePicture"),
  authController.changeProfilePic
);
router.get("/profile-pic/:userId", authController.getProfilePicture);
module.exports = router;
