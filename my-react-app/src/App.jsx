import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home/Home.jsx";
import TestPage from "./Test/TestPage.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Login/Register.jsx";
import "./App.css";

import { WebSocketProvider } from "./context/WebSocketContext";

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reg" element={<Register />} />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
