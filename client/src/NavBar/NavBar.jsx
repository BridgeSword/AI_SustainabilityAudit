import React, { useState, useEffect } from "react";
import "./NavBar.css";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
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
    sessionStorage.clear();
    setUsername(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* 左侧：Logo */}
      <button className="logo-btn" onClick={() => navigate("/")}>
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
      </button>

      {/* 中间：导航链接 */}
      <div className="nav-links">
        <NavLink
          to="/sector-ranking"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Sector Ranking
        </NavLink>
        <NavLink
          to="/innovative-detect"
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          Innovative Detect
        </NavLink>
      </div>

      {/* 右侧：登录/欢迎/登出 */}
      <div className="nav-right">
        {username ? (
          <>
            <span className="welcome-message">Welcome, {username}!</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-button" onClick={handleAuthClick}>
            {isLoginPage ? "Register" : "Login"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
