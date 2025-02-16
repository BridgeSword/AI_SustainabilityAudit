import React from "react";
import "./NavBar.css";
import logo from "/logo.png";

const NavBar = () => {
    return (
      <nav className="navbar">
        <div className="logo">
          <a href="/#home">
            <img src={logo} alt="Logo" className="logo-img" />
          </a>
        </div>
      </nav>
    );
};

export default NavBar;
