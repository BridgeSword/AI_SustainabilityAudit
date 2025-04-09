import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/Home.jsx";
import TestPage from "./Test/TestPage.jsx";
import Login from "./Login/Login.jsx";
import "./App.css";
import Register from "./Login/Register.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reg" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
