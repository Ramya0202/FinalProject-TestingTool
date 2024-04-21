import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SettingsScreeen from "./pages/SettingsScreen.jsx";
import { createBrowserHistory } from "history";
import HomeScreen from "./pages/HomeScreen.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const history = createBrowserHistory();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    console.log("test");
    history.push("/");
    window.location.reload();
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} handleLogin={handleLogin} />}
        />
        <Route
          path="/new-coverage"
          element={
            <Dashboard isLoggedIn={isLoggedIn} onLogout={handleLogout} />
          }
        />
        <Route
          path="/settings"
          element={<SettingsScreeen onLogout={handleLogout} />}
        />
        <Route path="/home" element={<HomeScreen onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

function Home({ isLoggedIn, handleLogin }) {
  return isLoggedIn ? (
    <Navigate to="/home" />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
