import React from "react";
import "./Home.css";
import NavBar from "../NavBar/NavBar.jsx";
import MidPanel from "./MidPanel.jsx";
import RightPanel from "./RightPanel.jsx";
const Home = () => {
  const pdfReports = [
    { name: "report1.pdf", path: "/data/reports/report1.pdf" },
    { name: "report2.pdf", path: "/data/reports/report2.pdf" },
    { name: "report3.pdf", path: "/data/reports/report3.pdf" }
  ];

  return (
    <div className="home-container">
      <NavBar />
      <div className="main-content">
        <div className="left-panel">
          <button className="text-button">+ New Report</button>
          <div className="history">
            <h3 className="history-title">History</h3>
            {pdfReports.map((report) => (
              <button
                key={report.name}
                onClick={() => window.open(report.path, "_blank")}
              >
                {report.name}
              </button>
            ))}
          </div>
        </div>

        <MidPanel />
        <div className="divider"></div>
        <RightPanel />
      </div>
    </div>
  );
};

export default Home;
