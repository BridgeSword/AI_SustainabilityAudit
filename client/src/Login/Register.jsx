import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import NavBar from "../NavBar/NavBar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
        const response = await fetch("http://localhost:9092/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_email: username, password: password, company_name: companyName }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          console.log("Register successful", data);
          sessionStorage.setItem("username", username);
          sessionStorage.setItem("user_id", data.user_id);
          sessionStorage.setItem("company", companyName);
          navigate("/");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred during registration (need valid email format)");
      }
      
  };


  return (
    <div className="reg-wrapper">
      <NavBar />
      <div className="reg-container">
        <div className="reg-box">
          <h2>Register Page</h2>
          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-input-group">
              <label htmlFor="username">Email: </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="reg-input-group">
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="reg-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="reg-input-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="reg-submit">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;