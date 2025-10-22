import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../Home/Home.css";
import "../../Home/MidPanel.css";
import "../../Home/RightPanel.css";
import "./InnovativeDetect.css";
import NavBar from "../../NavBar/NavBar.jsx";
import InnovativeDetectRightPanel from "./InnovativeDetectRightPanel.jsx";
import CompanyFolderPanel from "./CompanyFolderPanel.jsx";
import CompanyReportPanel from "./CompanyReportPanel.jsx";
import AnalysisPanel from "./AnalysisPanel.jsx";

export default function InnovativeDetect() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1=文件夹页  2=report页  3=分析结果页
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  function handleRefresh() {
    // 可以放刷新逻辑
    window.location.reload();
  }

  return (
    <div className="home-container sr-container">
      <NavBar />
      <div className="main-content sr-main">
        {/* Left Panel */}
        <div className="left-panel">
          <button className="text-button" onClick={() => navigate("/")}>
            ← Back Home
          </button>
          <button className="text-button" onClick={handleRefresh}>
            Refresh
          </button>

          <div className="history">
            <h3 className="history-title">Baseline</h3>
            <div className="history-list" style={{ maxHeight: 160, overflow: "auto" }}>
              {/* 将来可接 baseline 数据 */}
              <div className="history-item">Example Baseline</div>
            </div>
          </div>
        </div>

        {/* Mid Panel：根据 currentStep 渲染内容 */}
        <div className="mid-panel" style={{ width: "53vw" }}>
          {currentStep === 1 && (
            <CompanyFolderPanel
              onSelectCompany={(company) => {
                setSelectedCompany(company);
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <CompanyReportPanel
              company={selectedCompany}
              onBack={() => setCurrentStep(1)}
              onSelectReport={(report) => {
                setSelectedReport(report);
                setCurrentStep(3);
              }}
            />
          )}

          {currentStep === 3 && (
            <AnalysisPanel
              company={selectedCompany}
              report={selectedReport}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="divider"></div>
        <div className="right-panel sr-right">
          <InnovativeDetectRightPanel />
        </div>
      </div>
    </div>
  );
}
