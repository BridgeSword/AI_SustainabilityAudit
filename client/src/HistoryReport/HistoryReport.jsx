import { useLocation } from "react-router-dom";
import NavBar from "../NavBar/NavBar.jsx";

const HistoryReport = () => {
  const location = useLocation();
  const report = location.state?.report;

  if (!report) return <p>No report found.</p>;

  return (
    <div>
      {Object.entries(report).map(([key, value]) => (
        <p key={key}>
          <strong>{key}:</strong> {String(value)}
        </p>
      ))}
    </div>
  );
};

export default HistoryReport;
