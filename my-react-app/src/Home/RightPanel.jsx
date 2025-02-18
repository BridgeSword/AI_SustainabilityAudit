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

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newUserMessage = { role: "user", content: chatInput.trim() };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setChatInput("");
    setTimeout(() => {
      const machineReply = { role: "assistant", content: "Machine: I have received your input." };
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
          <div key={index} className={`chat-message-job ${chat.role}`}>
            <p>{chat.content}</p>
          </div>
        ))}
      </div>
      {chatHistory.length > 1 && (
        <button className="approve-button" onClick={handleApprove}>
          Approve
        </button>
      )}
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
