import React, { useState, useEffect } from "react";
import "./NavBar.css";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/logo.png";

const NavBar = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("username");
    setUsername(storedUser);
  }, [location]);

  const isLoginPage = location.pathname === "/login";

  const handleAuthClick = () => {
    if (isLoginPage) {
      navigate("/reg");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    setUsername(null);
  };


  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/#home">
          <img src={logo} alt="Logo" className="logo-img" />
        </a>
      </div>
      {username ? (
        <div className="welcome-section">
          <span className="welcome-message">Welcome, {username}!</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="login-button" onClick={handleAuthClick}>
          {location.pathname === "/login" ? "Register" : "Login"}
        </button>
      )}
    </nav>
  );
};

export default NavBar;
