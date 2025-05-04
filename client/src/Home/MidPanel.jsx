import React, { useState } from "react";
import "./MidPanel.css";

const MidPanel = ({ onGenerate }) => {
  const [reportName, setReportName] = useState("");
  const [standard, setStandard] = useState("iso");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [carboGoal, setCarboGoal] = useState("");
  const [carbonPlan, setCarbonPlan] = useState("");
  const [carbonAction, setCarbonAction] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const validatePdfFile = (file) => {
    return file.type === "application/pdf";
  };


   const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // Filter for only PDF files
    const pdfFiles = files.filter(file => validatePdfFile(file));

    if (pdfFiles.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    } else if (files.length > 0) {
      alert("Only PDF files are allowed.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);

    // Filter for only PDF files
    const pdfFiles = files.filter(file => validatePdfFile(file));

    if (pdfFiles.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    } else if (files.length > 0) {
      alert("Only PDF files are allowed.");
    }
  };

  const handleDeleteFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };


  const handleGenerate = async (e) => {
    e.preventDefault();

    if (selectedFiles.length > 0) {
      const uploadForm = new FormData();
      selectedFiles.forEach(file => uploadForm.append('files', file));
      try {
        setIsUploading(true);
        const resp = await fetch('http://localhost:9092/embeddings/v1/upload_file', {
          method: 'POST',
          body: uploadForm,
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text);
        }
        const result = await resp.json();
        console.log('Embedding upload response:', result);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('Failed to upload PDF files.');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    onGenerate({ reportName, standard, carboGoal, carbonPlan, carbonAction });
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
            <option value="GHG">GHG</option>
            <option value="ISO">ISO</option>
            <option value="CDP">CDP</option>
            <option value="SBTI">SBTI</option>
            <option value="TCFD">TCFD</option>
            <option value="CDSB">CDSB</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sample Reports Upload (PDF Only)</label>
          <label
            htmlFor="fileUpload"
            className="upload-box"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span className="upload-instruction">
              Click or drag to upload PDF files
            </span>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileUpload}
              className="file-input"
              accept=".pdf"
              multiple
            />
          </label>

          {selectedFiles.length > 0 && (
            <div className="files-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <img src="/file.jpg" alt="PDF Icon" className="file-icon" />
                    <p className="file-name">{file.name}</p>
                  </div>
                  <button
                    type="button"
                    className="delete-button-upload"
                    onClick={() => handleDeleteFile(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
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
