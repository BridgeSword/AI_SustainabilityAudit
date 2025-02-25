import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TestPage.css";
import NavBar from "../NavBar/NavBar.jsx";

const TestPage = () => {
  const navigate = useNavigate();

  // Test data
  const initialSections = [
    {
      title: "Executive Summary",
      content:
        "This Carbon Emissions Report for XYZ Corporation provides a comprehensive assessment of the organization's greenhouse gas (GHG) emissions, sources, and mitigation strategies for the fiscal year 2023. The analysis adheres to the Greenhouse Gas Protocol and covers Scope 1, Scope 2, and Scope 3 emissions. The report outlines key findings, including an estimated total emission of 120,500 metric tons of CO2 equivalent (tCO2e). The main emission sources are energy consumption (Scope 2), transportation (Scope 1), and supply chain activities (Scope 3). The company has committed to a 30% emission reduction by 2030 through a combination of renewable energy adoption, process optimization, and carbon offset programs.",
    },
    {
      title: "Scope 1 Emissions: Direct Emissions",
      content:
        "Scope 1 emissions include all direct greenhouse gas emissions from sources owned or controlled by XYZ Corporation. These sources primarily include fuel combustion from on-site facilities, vehicle fleet operations, and industrial processes. The total Scope 1 emissions for the year 2023 amount to 45,200 metric tons of CO2e. Breakdown of key contributors:\n- **On-site Natural Gas Combustion:** 28,000 tCO2e (heating, boilers, industrial operations)\n- **Company Vehicle Fleet:** 10,500 tCO2e (diesel and gasoline-powered transport)\n- **Refrigerant Leakage:** 6,700 tCO2e (HFCs from cooling systems)\n\nMitigation measures include fleet electrification, improved HVAC maintenance, and process efficiency improvements.",
    },
    {
      title: "Scope 2 Emissions: Indirect Emissions from Purchased Electricity",
      content:
        "Scope 2 emissions arise from purchased electricity consumed by XYZ Corporation's operations. The company sourced a total of 210 GWh of electricity in 2023, resulting in an estimated 60,300 metric tons of CO2e. The majority of emissions stem from grid electricity, with regional power mix emissions factors taken into account:\n- **Grid Electricity Consumption:** 55,000 tCO2e (coal-based energy sources dominate in the region)\n- **Renewable Energy Purchases:** 5,300 tCO2e (partial offset through Power Purchase Agreements)\n\nXYZ Corporation aims to transition to 50% renewable energy by 2027 by expanding solar panel installations at its facilities and increasing green power procurement.",
    },
    {
      title: "Scope 3 Emissions: Indirect Emissions from Supply Chain & Logistics",
      content:
        "Scope 3 emissions account for all other indirect emissions resulting from activities not owned or controlled by XYZ Corporation but occurring in its value chain. In 2023, Scope 3 emissions totaled 15,000 metric tons of CO2e, distributed as follows:\n- **Business Travel:** 5,200 tCO2e (employee flights, rental cars, hotel stays)\n- **Purchased Goods and Services:** 4,800 tCO2e (upstream supplier energy use)\n- **Transportation and Distribution:** 3,500 tCO2e (third-party logistics and shipping)\n- **End-of-life Product Disposal:** 1,500 tCO2e (consumer waste impact)\n\nTo mitigate Scope 3 emissions, the company is actively engaging suppliers to improve energy efficiency, shifting business travel policies towards virtual meetings, and optimizing logistics routes to reduce transport emissions.",
    },
    {
      title: "Carbon Reduction Strategies and Targets",
      content:
        "XYZ Corporation has established a science-based target to achieve a 30% reduction in carbon emissions by 2030 relative to 2020 levels. The strategies to reach this goal include:\n- **Renewable Energy Transition:** Increase on-site solar capacity to 100 MW and expand Power Purchase Agreements (PPAs) for wind energy.\n- **Fleet Electrification:** Convert 50% of company vehicles to electric by 2027.\n- **Operational Efficiency:** Implement advanced building energy management systems to reduce power consumption by 20%.\n- **Supply Chain Collaboration:** Work with suppliers to adopt low-carbon manufacturing practices and sustainable sourcing.\n- **Carbon Offsetting:** Invest in certified reforestation projects to offset residual emissions that cannot be eliminated through operational changes.",
    },
    {
      title: "Emissions Forecast for 2025 and 2030",
      content:
        "Based on XYZ Corporation's current emissions trajectory and planned reduction initiatives, the estimated emissions forecast is as follows:\n- **2025 Projection:** 110,000 tCO2e (10% reduction from 2023)\n- **2030 Projection:** 85,000 tCO2e (30% reduction from 2020 baseline)\n- **Net Zero Target:** Under evaluation for 2040\n\nKey risk factors include regulatory changes, fluctuations in energy costs, and technological adoption rates. Contingency measures include flexible energy procurement contracts and increased R&D investment in carbon capture technologies.",
    },
    {
      title: "Recommendations for Stakeholders",
      content:
        "To ensure the successful implementation of the carbon reduction roadmap, XYZ Corporation recommends the following actions for key stakeholders:\n- **Executives & Board of Directors:** Allocate additional capital for renewable energy investments and ensure alignment with ESG (Environmental, Social, and Governance) commitments.\n- **Employees:** Participate in internal sustainability programs, including energy conservation initiatives and company-sponsored EV programs.\n- **Suppliers:** Commit to Science-Based Targets and disclose Scope 1 and Scope 2 emissions in procurement contracts.\n- **Customers & Investors:** Engage in transparent ESG reporting and support low-carbon product development through sustainable purchasing choices.\n\nBy fostering collaboration across all stakeholders, XYZ Corporation aims to accelerate its sustainability transformation and contribute to global carbon neutrality goals.",
    },
    {
      title: "Conclusion",
      content:
        "This Carbon Report outlines XYZ Corporation's current emissions profile, reduction strategies, and future targets. With a strong commitment to sustainability, the company is well-positioned to achieve significant carbon reductions in the coming decade. Ongoing monitoring, stakeholder collaboration, and technological advancements will play crucial roles in reaching the company's net-zero ambition. The next steps involve refining the emissions reduction roadmap, aligning with evolving regulatory frameworks, and continuously innovating to enhance sustainability performance.",
    },
  ];


  const [sections, setSections] = useState(initialSections);
  const [selectedSection, setSelectedSection] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Welcome! To generate Carbon Report, please adjust the content and click the generate button.",
    },
  ]);

  const [previewMode, setPreviewMode] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const chatHistoryRef = useRef(null);
  const sectionRefs = useRef([]);
  const reportRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to the selected section
  const scrollToSection = (index) => {
    if (sectionRefs.current[index]) {
      sectionRefs.current[index].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
    const newContent = approvedMessage.content.replace(
      /^Proposed change for ".*?": /,
      ""
    );
  
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
    // Create a downloadable file with the report content
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
              <div className="test-chat-box-title">
                Carbon Report (Preview Mode)
              </div>
            </div>
            <div className="test-preview-header-bottom">
              {selectedSection !== null && !isEditing && (
                <button
                  className="test-edit-button"
                  onClick={handleEditClick}
                >
                  Edit Section
                </button>
              )}
              <button
                className="test-generate-job-button"
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
          <div className="test-preview-container">
            {/* Left: Report Outline */}
            <div className="test-report-outline">
              <h3>Report Outline</h3>
              <ul>
                {sections.map((section, index) => (
                  <li
                    key={index}
                    className={
                      selectedSection === index ? "selected-outline" : ""
                    }
                    onClick={() => handleSectionClick(index)}
                  >
                    {section.title}
                  </li>
                ))}
              </ul>
            </div>
            {/* Right: Report Content */}
            <div className="test-preview-canvas" ref={reportRef}>
              {isEditing && selectedSection !== null ? (
                <div className="test-edit-container">
                  <h4 className="test-preview-section-title">
                    {sections[selectedSection].title}
                  </h4>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="test-edit-textarea"
                  />
                  <div className="test-edit-buttons">
                    <button
                      className="test-save-button"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </button>
                    <button
                      className="test-cancel-button"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                sections.map((section, index) => (
                  <div
                    key={index}
                    className="test-preview-section"
                    ref={(el) => (sectionRefs.current[index] = el)} // Assign ref to each section
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
              {/* Left: Report Outline */}
              <div className="test-report-outline">
                <h3>Report Outline</h3>
                <ul>
                  {sections.map((section, index) => (
                    <li
                      key={index}
                      className={
                        selectedSection === index ? "selected-outline" : ""
                      }
                      onClick={() => handleSectionClick(index)}
                    >
                      {section.title}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Middle: All sections */}
              <div className="test-jd-content">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className={`test-field-container ${
                      selectedSection === index ? "selected" : ""
                    }`}
                    onClick={() => handleSectionClick(index)}
                  >
                    <h4 className="test-field-label">{section.title}</h4>
                    <div className="test-field-value">
                      {parseFormattedText(section.content)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Right: Chatbot */}
              <div className="test-chat-box-job">
                <div className="test-chat-box-header">
                  <div className="test-header-left">
                    <div className="test-chat-box-title">
                      Modify Report
                    </div>
                  </div>
                  <div className="test-header-right">
                    <button
                      className="test-preview-btn2"
                      onClick={enterPreviewMode}
                    >
                      Preview <img src="/zoom-in.png" alt="Zoom In" />
                    </button>
                    <button
                      className="test-generate-job-button"
                      onClick={handleGenerateJob}
                    >
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
                          <button
                            className="test-approve-button"
                            onClick={() => handleApproveChange(index)}
                          >
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
                            sections[selectedSection].title.length > 10
                              ? sections[selectedSection].title.slice(0, 30)
                              : sections[selectedSection].title
                          }" ...`
                        : "Please first select a section to modify"
                    }
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

export default TestPage;
