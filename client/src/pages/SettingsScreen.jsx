import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  FormControl,
  Avatar,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ResponsiveAppBar from "../components/Appbar";
import { jwtDecode } from "jwt-decode";

const SettingsScreen = ({ onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = jwtDecode(token);

      const response = await axios.get(
        `http://localhost:5000/auth/profile-pic/${user.userId}`
      );
      await setProfilePicture(response.data.profilePicture);
      // console.log("response", response);
      // console.log("response.date", response.data);
      // console.log("Profile Pic",profilePicture);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPasswordError("Password is required");
      return;
    } else {
      setPasswordError("");
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    } else {
      setPasswordError("");
    }

    const token = localStorage.getItem("token");
    const user = jwtDecode(token);

    try {
      const response = await axios.put(
        "http://localhost:5000/auth/change-password",
        {
          username: user?.username,
          currentPassword: currentPassword,
          newPassword: newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error changing password:", error.response.data.message);
    }
  };

  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please select an image file");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", selectedImage);
    const token = localStorage.getItem("token");
    const user = jwtDecode(token);

    try {
      const response = await axios.post(
        `http://localhost:5000/auth/upload-profile-picture/${user.userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.info("Profile picture uploaded successfully");
        fetchProfilePicture();
        setImagePreview(null);
      } else {
        alert(response.data.message || "Failed to upload profile picture");
      }
    } catch (error) {
      toast.error("Error uploading profile picture. Please try again later.");
    }
  };

  return (
    <>
      <ResponsiveAppBar onLogout={onLogout} />
      <Container
        sx={{
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        maxWidth="lg"
      >
        <Box
          sx={{
            padding: 4,
            borderRadius: 4,
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "45%",
          }}
        >
          <Typography component="h1" variant="h5">
            Change Password
          </Typography>
          <FormControl
            fullWidth
            component="form"
            onSubmit={handleSubmitPassword}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              type="password"
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="password"
              id="newPassword"
              label="New Password"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              autoComplete="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update Password
            </Button>
          </FormControl>
        </Box>
        <Box
          sx={{
            padding: 4,
            borderRadius: 4,
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "45%",
          }}
        >
          <Typography component="h1" variant="h5">
            Change Profile Picture
          </Typography>
          <FormControl
            fullWidth
            component="form"
            onSubmit={handleSubmitImage}
            sx={{ mt: 1 }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                marginBottom: 2,
              }}
              alt="Profile Picture"
              src={
                imagePreview === null
                  ? `http://localhost:5000/auth/profile-pictures/${profilePicture}`
                  : imagePreview
              }
            />
            <TextField
              margin="normal"
              fullWidth
              type="file"
              id="image"
              label=""
              accept="image/*"
              onChange={handleImageChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Update Profile Picture
            </Button>
          </FormControl>
        </Box>
      </Container>
    </>
  );
};

export default SettingsScreen;
