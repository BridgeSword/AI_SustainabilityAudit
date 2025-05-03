import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Home from "./Home/Home.jsx";
import TestPage from "./Test/TestPage.jsx";
import Login from "./Login/Login.jsx";
import Register from "./Login/Register.jsx";
import HistoryReport from "./HistoryReport/HistoryReport.jsx";
import "./App.css";

import { WebSocketProvider } from "./context/WebSocketContext";

function App() {
  const [historyData, setHistoryData] = useState(null); // 0503
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home historyData={historyData}/>} /*0503*/ />
          <Route path="/test" element={<TestPage />} />
          <Route path="/login" element={<Login onHistory={setHistoryData}/>} /*0503*/ />
          <Route path="/reg" element={<Register />} />
          <Route path="/history-report" element={<HistoryReport />} /*0503*/ />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;
