import React, { useState } from "react";
import "./MidPanel.css";

const MidPanel = ({ onGenerate }) => {
  const [reportName, setReportName] = useState("");
  const [standard, setStandard] = useState("iso");
  const [selectedFile, setSelectedFile] = useState(null);
  const [carboGoal, setCarboGoal] = useState("");
  const [carbonPlan, setCarbonPlan] = useState("");
  const [carbonAction, setCarbonAction] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteFile = (e) => {
    e.preventDefault();
    setSelectedFile(null);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    const formData = {
      reportName,
      standard,
      carboGoal,
      carbonPlan,
      carbonAction,
    };

    onGenerate(formData);
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="mid-panel">
      <div className="mid-panel-header">
        <h2>Carbon Report</h2>
        <hr className="header-hr" />
      </div>

      <form className="mid-panel-form" onSubmit={handleGenerate}>
        <div className="form-group">
          <label htmlFor="reportName">Report Name</label>
          <textarea
            id="reportName"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter report name"
            className="full-width auto-resize"
            rows="2"
            onInput={autoResize}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="standard">Carbon Standard</label>
          <select
            id="standard"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="full-width"
          >
            <option value="iso">iso</option>
            <option value="CSRD">CSRD</option>
            <option value="TCFD">TCFD</option>
            <option value="ISSB">ISSB</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sample Report Upload (Optional)</label>
          {selectedFile ? (
            <div className="uploaded-content">
              <img src="/file.jpg" alt="File Icon" />
              <p className="candidate-upload-title">File uploaded: </p>
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <button
                  className="delete-button-upload"
                  onClick={handleDeleteFile}
                >
                  X
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="fileUpload"
              className="upload-box"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <span className="upload-instruction">
                Click or drag to upload file
              </span>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                className="file-input"
              />
            </label>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="carboGoal">Carbon Goal</label>
          <textarea
            id="carboGoal"
            value={carboGoal}
            onChange={(e) => setCarboGoal(e.target.value)}
            placeholder="Enter carbon goal"
            className="full-width auto-resize"
            rows="5"
            onInput={autoResize}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="carbonPlan">Carbon Plan</label>
          <textarea
            id="carbonPlan"
            value={carbonPlan}
            onChange={(e) => setCarbonPlan(e.target.value)}
            placeholder="Enter carbon plan"
            className="full-width auto-resize"
            rows="5"
            onInput={autoResize}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="carbonAction">Carbon Action</label>
          <textarea
            id="carbonAction"
            value={carbonAction}
            onChange={(e) => setCarbonAction(e.target.value)}
            placeholder="Enter carbon action"
            className="full-width auto-resize"
            rows="5"
            onInput={autoResize}
          ></textarea>
        </div>

        <button type="submit" className="save-button full-width">
          Generate
        </button>
      </form>
    </div>
  );
};

export default MidPanel;
