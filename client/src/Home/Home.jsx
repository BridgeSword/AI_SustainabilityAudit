import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import NavBar from "../NavBar/NavBar.jsx";
import MidPanel from "./MidPanel.jsx";
import RightPanel from "./RightPanel.jsx";

const Home = () => {
  const navigate = useNavigate(); // 0503
  const [formData, setFormData] = useState(null);
  const historyRaw = sessionStorage.getItem("history");
  const historyData = historyRaw ? JSON.parse(historyRaw) : [];

  return (
    <div className="home-container">
      <NavBar />
      <div className="main-content">
        <div className="left-panel">
          <button className="text-button">+ New Report</button>
          <div className="history">
            <h3 className="history-title">History</h3>
            {historyData != null && historyData.length > 0 ? (
            historyData.map((report) => (
              <button
                key={report._id}
                onClick={() => navigate("/history-report", { state: { report } })}
              >
                {report._id}
              </button>
            ))
          ) : (
            <p>No history available.</p> // or just leave this blank if you want nothing
          )}
          </div>
        </div>

        <MidPanel onGenerate={setFormData} />
        <div className="divider"></div>
        <RightPanel formData={formData} />
      </div>
    </div>
  );
};

export default Home;
