import React, { useState } from "react";

const mockCompanies = ["Company A", "Company B", "Company C", "Company D"];

export default function CompanyFolderPanel({ onSelectCompany }) {
  const [query, setQuery] = useState("");

  const filtered = mockCompanies.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="mid-panel-header">
        <h2>Innovative Action Detecting</h2>
        <hr className="header-hr" />
      </div>

      <div className="form-row" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          className="form-input"
          placeholder="Search company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="save-button">Search</button>
      </div>

      <div className="uploaded-content" style={{ maxHeight: "55vh", overflow: "auto" }}>
        {filtered.map((company) => (
          <div
            key={company}
            className="company-folder"
            onClick={() => onSelectCompany(company)}
          >
            📁 {company}
          </div>
        ))}
      </div>
    </>
  );
}
