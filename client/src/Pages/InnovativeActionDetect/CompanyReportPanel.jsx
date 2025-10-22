import React, { useState } from "react";

const mockReports = [
  { year: 2024, name: "Sustainability Report 2024" },
  { year: 2023, name: "Sustainability Report 2023" },
  { year: 2022, name: "Sustainability Report 2022" },
];

export default function CompanyReportPanel({ company, onBack, onSelectReport }) {
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = mockReports
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sortAsc ? a.year - b.year : b.year - a.year));

  return (
    <>
      <div className="mid-panel-header">
        <h2>{company} Reports</h2>
        <hr className="header-hr" />
      </div>

      <div className="form-row" style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          className="form-input"
          placeholder="Search report..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="save-button">Search</button>
        <button
          className="save-button"
          onClick={() => setSortAsc(!sortAsc)}
        >
          Sort Year {sortAsc ? "↑" : "↓"}
        </button>
      </div>

      <div className="uploaded-content" style={{ maxHeight: "55vh", overflow: "auto" }}>
        {filtered.map((r) => (
          <div key={r.name} className="table-row-report">
            <span>{r.year}</span>
            <span style={{ flex: 1 }}>{r.name}</span>
            <button
              className="save-button"
              onClick={() => onSelectReport(r)}
            >
              Start Analyzing
            </button>
          </div>
        ))}
      </div>

      <button className="btn-link" onClick={onBack}>← Back to Companies</button>
    </>
  );
}
