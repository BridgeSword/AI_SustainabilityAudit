import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Home from "./Home/Home.jsx";
import TestPage from "./Test/TestPage.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Login/Register.jsx";
import HistoryReport from "./HistoryReport/HistoryReport.jsx";
import "./App.css";

import { WebSocketProvider } from "./context/WebSocketContext";

function App() {
  const [historyData, setHistoryData] = useState(() => {
    const stored = sessionStorage.getItem("history");
    return stored ? JSON.parse(stored) : null;
  });
  useEffect(() => {
    if (historyData) {
      sessionStorage.setItem("history", JSON.stringify(historyData));
    }
  }, [historyData]);  
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reg" element={<Register />} />
          <Route path="/history-report" element={<HistoryReport />} /*0503*/ />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
