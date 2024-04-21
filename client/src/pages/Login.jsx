import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LoginScreen = ({ onLogin }) => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [fullNameError, setFullNameError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const responseGoogle = async (response) => {
    const credential = jwtDecode(response.credential);
    console.log({ credential });
    if (credential) {
      axios
        .post(
          "http://localhost:5000/auth/signup",
          {
            fullName: credential.name,
            username: credential.name,
            password: "TEST",
            isgoogle: true,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(async (res) => {
          if (res) {
            const loginResponse = await axios.post(
              "http://localhost:5000/auth/login",
              {
                username: res.data.username,
                password: res.data.password,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            console.log(loginResponse.data);
            if (loginResponse.data.token) {
              toast.success(loginResponse.data.message);
              onLogin();
              localStorage.setItem("token", loginResponse.data.token);
            }
          }
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    } else {
      setUsernameError("");
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    } else {
      setPasswordError("");
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      if (response.data.token) {
        toast.success(response.data.message);
        onLogin();
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      toast.warning(error.response.data.message);
      console.error("Error logging in:", error.response.data.message);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    let isValid = true;
    if (!fullName.trim()) {
      setFullNameError("Full Name is required");
      isValid = false;
    } else {
      setFullNameError("");
    }
    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    } else {
      setUsernameError("");
    }
    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      try {
        const response = await axios.post(
          "http://localhost:5000/auth/signup",
          {
            fullName: fullName,
            username: username,
            password: password,
            isgoogle: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log({ response });
        toast.success(response.data.message);
        setIsLogin(!isLogin);
        setFullName("");
        setUsername("");
        setPassword("");
      } catch (error) {
        toast.warning(error.response.data.message);
        console.error("Error logging in:", error.message);
      }
    }
  };
  const backgroundImage =
    "https://png.pngtree.com/thumb_back/fh260/background/20220522/pngtree-abstract-white-and-light-gray-wave-modern-soft-luxury-texture-with-image_1379862.jpg";
  return (
    <Container
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      maxWidth="xl"
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: 4,
          borderRadius: 4,
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "30%",
        }}
      >
        <Typography component="h1" variant="h5">
          {isLogin ? "Login" : "Sign Up"}
        </Typography>
        <FormControl
          fullWidth
          component="form"
          onSubmit={isLogin ? handleSubmit : handleCreateAccount}
          sx={{ mt: 1 }}
        >
          {!isLogin && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                autoComplete="name"
                autoFocus={!isLogin}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!fullNameError}
                helperText={fullNameError}
              />
            </>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus={isLogin}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText={usernameError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {isLogin ? "Login" : "Create Account"}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setIsLogin(!isLogin);
                setFullName("");
                setUsername("");
                setPassword("");
              }}
            >
              {isLogin ? "Create Account" : "Back to Login"}
            </Button>
            <div style={{ marginTop: 15 }}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  console.log(credentialResponse);
                  responseGoogle(credentialResponse);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
        </FormControl>
      </Box>
    </Container>
  );
};

export default LoginScreen;
