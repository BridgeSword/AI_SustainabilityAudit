import { useLocation } from "react-router-dom";
import NavBar from "../NavBar/NavBar.jsx";

const HistoryReport = () => {
  const location = useLocation();
  const report = location.state?.report;

  if (!report) return <p>No report found.</p>;

  const keysToDisplay = ["reportName", "standard", "goal", "user_plan", "action"]; // Replace with your desired keys
  const keyDisplayNames = {
    reportName: "Report Name",
    standard: "Carbon Standard",
    goal: "Carbon Goal",
    user_plan: "Carbon Plan",
    action: "Carbon Action",
  };

  return (
    <div>
      {Object.entries(report)
        .filter(([key]) => keysToDisplay.includes(key)) // filter based on keysToDisplay
        .map(([key, value]) => (
          <p key={key}>
            <strong>{keyDisplayNames[key] || key}:</strong> {String(value)}
          </p>
        ))}
    </div>
  );
};

export default HistoryReport;
