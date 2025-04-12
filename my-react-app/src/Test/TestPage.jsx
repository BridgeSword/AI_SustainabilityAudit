import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TestPage.css";
import NavBar from "../NavBar/NavBar.jsx";
import { useGlobalWebSocket } from "../context/WebSocketContext";

const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const globalWs = useGlobalWebSocket();

  const initialSections = [
  ];


  const [isLoading, setIsLoading] = useState(location.state?.loading || false);
  const [sections, setSections] = useState(initialSections);
  const [selectedSection, setSelectedSection] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Welcome! To generate Carbon Report, please adjust the content and click the generate button."
    }
  ]);
  const [previewMode, setPreviewMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const chatHistoryRef = useRef(null);
  const sectionRefs = useRef([]);
  const reportRef = useRef(null);
  const textareaRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    if (!globalWs) return; 
    if (!location.state?.proceed) return; 

    console.log("TestPage: proceed detected, starting final generation...");
    setIsLoading(true);

    if (globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify({ proceed: true }));
    } else {
      globalWs.onopen = () => {
        globalWs.send(JSON.stringify({ proceed: true }));
      };
    }

    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    const totalTime = 250000; 
    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / totalTime) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressTimerRef.current);
      }
    }, 1000);

  }, [globalWs, location.state]);

  useEffect(() => {
    if (!globalWs) return;

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.task_status === "SUCCESS" && data.response) {
        console.log("TestPage got final data =>", data);

        const resultArray = Array.isArray(data.response) ? data.response : [];
        const newSections = resultArray.map(item => {
          const content = item.agent_output;
          return { title: item.section, content };
        });

        if (newSections.length > 0) {
          setSections(newSections);
        }

        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
        }
        setProgress(100);

        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    globalWs.addEventListener("message", handleMessage);
    return () => {
      globalWs.removeEventListener("message", handleMessage);
    };
  }, [globalWs]);


  useEffect(() => {
    if (!location.state?.reportData || location.state?.proceed) return;

    const data = location.state.reportData;
    if (Array.isArray(data)) {
      const newSections = data.map(item => {
        const content = `${item.description}\n\n${item.agent_output}`;
        return { title: item.section, content };
      });
      setSections(newSections);
    } else if (typeof data === "string") {
      const parsedSections = data
        .split("###")
        .filter(Boolean)
        .map(sectionStr => {
          const trimmed = sectionStr.trim();
          const [titleLine, ...contentLines] = trimmed.split("\n");
          return {
            title: titleLine,
            content: contentLines.join("\n")
          };
        });
      if (parsedSections.length > 0) {
        setSections(parsedSections);
      } else {
        setSections([{ title: "Report", content: data }]);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing, editContent]);

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="test-loading-container">
          <h2>Generating final report...</h2>
          <p>Please wait while we finalize the data...</p>
          <ProgressBar progress={progress} /> 
        </div>
      </>
    );
  }


  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSectionClick = (index) => {
    setSelectedSection(index);
    if (previewMode) {
      scrollToSection(index);
    }
  };

  const handleEditClick = () => {
    if (selectedSection === null) {
      alert("Please select a section to edit.");
      return;
    }
    setIsEditing(true);
    setEditContent(sections[selectedSection].content);
  };

  const handleSaveEdit = () => {
    if (selectedSection === null || !editContent.trim()) {
      alert("Please input something to modify!");
      return;
    }
    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections[selectedSection] = {
        ...newSections[selectedSection],
        content: editContent,
      };
      return newSections;
    });

    const currentTitle = sections[selectedSection].title;
    const userMsg = { role: "user", content: editContent };
    const assistantMsg = {
      role: "assistant",
      content: `Updated "${currentTitle}" in preview mode.`,
    };
    setChatHistory((prev) => [...prev, userMsg, assistantMsg]);

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleApproveChange = (index) => {
    const updatedChatHistory = [...chatHistory];
    const approvedMessage = updatedChatHistory[index];
    if (!approvedMessage.pendingApproval) return;

    const sectionIndex = approvedMessage.sectionIndex;
    const newContent = approvedMessage.content.replace(/^Proposed change for ".*?": /, "");

    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        content: newContent,
      };
      return newSections;
    });

    updatedChatHistory[index] = {
      ...approvedMessage,
      pendingApproval: false,
      content: `Approved change for "${sections[sectionIndex].title}": ${newContent}`,
    };

    setChatHistory(updatedChatHistory);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) {
      alert("Please input something to modify！");
      return;
    }
    if (selectedSection === null) {
      alert("Please select the field to change！");
      return;
    }

    const currentTitle = sections[selectedSection].title;
    const userMsg = { role: "user", content: chatInput };

    const updatedChatHistory = chatHistory.map((chat) => ({
      ...chat,
      pendingApproval: false,
    }));

    const assistantMsg = {
      role: "assistant",
      content: `Proposed change for "${currentTitle}": ${chatInput}`,
      pendingApproval: true,
      sectionIndex: selectedSection,
    };

    setChatHistory([...updatedChatHistory, userMsg, assistantMsg]);
    setChatInput("");
  };

  const handleGenerateJob = () => {
    console.log("Generated with data:", sections);
    navigate("/jobs", { state: { sections } });
  };

  const handleDownload = () => {
    const reportContent = sections
      .map((section) => `### ${section.title}\n\n${section.content}`)
      .join("\n\n");

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Carbon_Report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const enterPreviewMode = () => {
    setPreviewMode(true);
  };

  const exitPreviewMode = () => {
    setPreviewMode(false);
  };

  const parseFormattedText = (text) => {
    return text.split("\n").map((line, index) => {
      if (line.startsWith("- ")) {
        return (
          <li key={index}>
            {line
              .slice(2)
              .split(/(\*\*.*?\*\*)/g)
              .map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                  part
                )
              )}
          </li>
        );
      }
      return (
        <p key={index}>
          {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  };

  return (
    <>
      {previewMode ? (
        // ===== Preview Mode =====
        <div className="test-preview-mode">
          <NavBar />
          <div className="test-preview-header">
            <div className="test-preview-header-top">
              <div className="test-chat-box-title">Carbon Report (Preview Mode)</div>
            </div>
            <div className="test-preview-header-bottom">
              {selectedSection !== null && !isEditing && (
                <button className="test-edit-button" onClick={handleEditClick}>
                  Manually Edit
                </button>
              )}
              <button className="test-generate-job-button" onClick={exitPreviewMode}>
                AI-Assisted Edit
              </button>
              <button className="test-generate-job-button" onClick={handleDownload}>
                Download
              </button>
            </div>
          </div>

          <div className="test-preview-container">
            <div className="test-report-outline">
              <h3>Report Outline</h3>
              <ul>
                {sections.map((section, index) => (
                  <li
                    key={index}
                    className={selectedSection === index ? "selected-outline" : ""}
                    onClick={() => handleSectionClick(index)}
                  >
                    {section.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="test-preview-canvas" ref={reportRef}>
              {isEditing && selectedSection !== null ? (
                <div className="test-edit-container">
                  <h4 className="test-preview-section-title">{sections[selectedSection].title}</h4>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="test-edit-textarea"
                  />
                  <div className="test-edit-buttons">
                    <button className="test-save-button" onClick={handleSaveEdit}>
                      Save Changes
                    </button>
                    <button className="test-cancel-button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                sections.map((section, index) => (
                  <div
                    key={index}
                    className="test-preview-section"
                    ref={(el) => (sectionRefs.current[index] = el)}
                  >
                    <h4 className="test-preview-section-title">{section.title}</h4>
                    <div className="test-preview-section-content">
                      {parseFormattedText(section.content)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // ===== Normal Mode =====
        <div className="home-container">
          <NavBar />
          <div className="test-jd-page-container">
            <div className="test-jd-main-content">
              <div className="test-report-outline">
                <h3>Report Outline</h3>
                <ul>
                  {sections.map((section, index) => (
                    <li
                      key={index}
                      className={selectedSection === index ? "selected-outline" : ""}
                      onClick={() => handleSectionClick(index)}
                    >
                      {section.title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="test-jd-content">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className={`test-field-container ${selectedSection === index ? "selected" : ""}`}
                    onClick={() => handleSectionClick(index)}
                  >
                    <h4 className="test-field-label">{section.title}</h4>
                    <div className="test-field-value">
                      {parseFormattedText(section.content)}
                    </div>
                  </div>
                ))}
              </div>

              {/*Chatbox */}
              <div className="test-chat-box-job">
                <div className="test-chat-box-header">
                  <div className="test-header-left">
                    <div className="test-chat-box-title">Modify Report</div>
                  </div>
                  <div className="test-header-right">
                    <button className="test-preview-btn2" onClick={enterPreviewMode}>
                      Preview <img src="/zoom-in.png" alt="Zoom In" />
                    </button>
                    <button className="test-generate-job-button" onClick={handleGenerateJob}>
                      Save
                    </button>
                  </div>
                </div>
                <div className="test-chat-history-job" ref={chatHistoryRef}>
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`test-chat-message-job ${chat.role}`}>
                      <p>{chat.content}</p>
                      {chat.pendingApproval && (
                        <div className="test-approve-container">
                          <button className="test-approve-button" onClick={() => handleApproveChange(index)}>
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      selectedSection !== null
                        ? `Please input change for "${
                            sections[selectedSection].title.length > 30
                              ? sections[selectedSection].title.slice(0, 30) + "..."
                              : sections[selectedSection].title
                          }" ...`
                        : "Please first select a section to modify"
                    }
                    disabled={selectedSection === null}
                  />
                  <button type="submit" disabled={selectedSection === null}>
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


const ProgressBar = ({ progress }) => {
  return (
    <div
      style={{
        width: "100%",        
        backgroundColor: "#ddd",
        marginTop: "15px",
        height: "15px",
        borderRadius: "8px",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: progress + "%",
          height: "100%",
          backgroundColor: "#128c7e",
          transition: "width 1s linear",
          borderRadius: "8px"
        }}
      />
    </div>
  );
};

export default TestPage;
