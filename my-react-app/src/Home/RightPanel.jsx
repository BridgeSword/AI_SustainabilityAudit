import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RightPanel.css";

const RightPanel = () => {
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: 'Please click "Save" in the editor to start editing.' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatHistoryRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

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
  
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newUserMessage = { role: "user", content: chatInput.trim() };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput("");
    
    setTimeout(() => {
      const machineReply = {
        role: "assistant",
        content: `Carbon Emissions Report Plan
  
  **Objective:**  
  This plan outlines the approach for assessing and mitigating XYZ Corporation’s carbon emissions for the fiscal year 2023, covering Scope 1, Scope 2, and Scope 3 emissions.
  
  **Key Steps:**
  
  1. **Data Collection & Analysis:**  
     - Gather emission data from direct (Scope 1), indirect energy (Scope 2), and supply chain activities (Scope 3).  
     - Use the Greenhouse Gas Protocol for standardized reporting.  
  
  2. **Emission Breakdown:**  
     - Identify key emission sources: fuel combustion, electricity consumption, and supplier emissions.  
     - Quantify total CO2 equivalent (tCO2e) emissions and categorize them accordingly.  
  
  3. **Reduction Strategies:**  
     - **Renewable Energy Transition:** Increase solar and wind energy procurement.  
     - **Fleet Electrification:** Transition company vehicles to electric models.  
     - **Operational Efficiency:** Optimize energy use in buildings and manufacturing.  
     - **Supply Chain Collaboration:** Work with vendors to reduce upstream emissions.  
     - **Carbon Offsetting:** Invest in reforestation and verified carbon credit programs.  
  
  4. **Targets & Monitoring:**  
     - Set a 30% emission reduction goal by 2030.  
     - Regularly track progress and refine strategies based on industry best practices.  
  
  **Expected Outcome:**  
  By implementing this plan, XYZ Corporation will enhance sustainability, reduce its carbon footprint, and align with global environmental goals while ensuring compliance with regulatory requirements.`
      };
      setChatHistory((prev) => [...prev, machineReply]);
    }, 1000);
  };

  const handleApprove = () => {
    navigate("/test");
  };

  return (
    <div className="chat-box-job">
      <div className="chat-history-job2" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message-wrapper ${chat.role}`}>
            {chat.role === "assistant" && (
              <img
                src="/bot.png"
                alt="Bot Icon"
                className="chat-icon"
              />
            )}
            <div className={`chat-message-job ${chat.role === "assistant" && index !== 0 ? "with-approve" : ""}`}>
              <p>{parseFormattedText(chat.content)}</p>
              {chat.role === "assistant" && index !== 0 && (
                <button className="approve-button" onClick={handleApprove}>
                  Approve
                </button>
              )}
            </div>
            {chat.role === "user" && (
              <img
                src="/user.png"
                alt="User Icon"
                className="chat-icon"
              />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Enter your changes here..."
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RightPanel;
