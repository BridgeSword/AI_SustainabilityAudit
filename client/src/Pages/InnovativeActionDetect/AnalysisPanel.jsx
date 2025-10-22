import React from "react";

const mockAnalysis = {
  disruptive: [
    "Introduced a net-zero logistics strategy",
    "Deployed AI-based sustainability tracking system",
  ],
  incremental: [
    "Upgraded renewable energy mix from 40% to 60%",
    "Improved employee sustainability training program",
  ],
};

export default function AnalysisPanel({ company, report, onBack }) {
  return (
    <>
      <div className="mid-panel-header">
        <h2>
          {company} — {report.name}
        </h2>
        <hr className="header-hr" />
      </div>

      <div className="uploaded-content">
        <h3>Disruptive Innovative Actions</h3>
        <ul>
          {mockAnalysis.disruptive.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <h3>Incremental Innovative Actions</h3>
        <ul>
          {mockAnalysis.incremental.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <button className="btn-link" onClick={onBack}>
        ← Back to Reports
      </button>
    </>
  );
}
