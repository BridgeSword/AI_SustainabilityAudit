import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import NavBar from "../NavBar/NavBar";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:9092/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_email: username, password: password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        console.log("Login successful", data);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("user_id", data.user_id);
        navigate("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login (need valid email)");
    }
  };

  return (
    <div className="loginpage-wrapper">
      <NavBar />
      <div className="loginpage-container">
        <div className="loginpage-box">
          <h2>Login Page</h2>
          <form onSubmit={handleSubmit} className="loginpage-form">
            <div className="loginpage-input-group">
              <label htmlFor="username">Email: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="loginpage-input-group">
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="loginpage-submit">
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;