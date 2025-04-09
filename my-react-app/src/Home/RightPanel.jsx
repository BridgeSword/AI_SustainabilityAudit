import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RightPanel.css";

const RightPanel = ({ formData }) => {
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hello! How can I help you today? Please first fill out the info in the left part!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatHistoryRef = useRef(null);
  const ws = useRef(null);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!formData) return;

    ws.current = new WebSocket("ws://localhost:8765");

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      ws.current.send(JSON.stringify(formData));
      setChatHistory((prev) => [
        ...removeApproves(prev), 
        { role: "assistant", content: "Thinking...", isThinking: true }
      ]);
    };

    ws.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      setChatHistory((prev) => {
        let newHistory = [...removeApproves(prev)];

        if (receivedData.status === "thinking") {
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            content: `🤔 ${receivedData.progress}` 
          };
        } else if (receivedData.status === "processing") {
          newHistory[newHistory.length - 1] = {
            ...newHistory[newHistory.length - 1],
            content: `⏳ ${receivedData.progress}`
          };
        } else if (receivedData.status === "completed") {
          newHistory[newHistory.length - 1] = {
            role: "assistant",
            content: "",
            fullContent: receivedData.result,
            isThinking: false,
            showApprove: false
          };
          simulateTyping(newHistory.length - 1, receivedData.result);
        }
        return newHistory;
      });
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [formData]);
  

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

  const autoResizeChat = (e) => {
    const el = e.target;
    el.style.height = "auto";
    const style = window.getComputedStyle(el);
    let lineHeight = style.lineHeight;
    console.log(lineHeight)
    console.log(el.scrollHeight)
    if (lineHeight === "normal") {
      lineHeight = 54;
    } else {
      lineHeight = parseFloat(lineHeight);
    }
    if (el.scrollHeight > lineHeight + 4) {
      el.style.height = "8vh";
    } else {
      el.style.height = "5vh";
    }
  };
  
  
  
  const removeApproves = (history) => {
    return history.map((chat) => ({
      ...chat,
      showApprove: false
    }));
  };

  const simulateTyping = (index, fullText) => {
    let i = 0;
    const interval = setInterval(() => {
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[index] = {
          ...newHistory[index],
          content: fullText.substring(0, i)
        };
        return newHistory;
      });
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setChatHistory((prev) => {
          let updatedHistory = [...prev];
          updatedHistory[index] = {
            ...updatedHistory[index],
            showApprove: true 
          };
          return updatedHistory;
        });
      }
    }, 50);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput.trim() };
    setChatHistory((prev) => [...removeApproves(prev), userMessage]); 
    setChatInput("");

    ws.current.send(JSON.stringify({ message: chatInput.trim() }));
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "5vh";
    }

    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "⏳ Processing...", isThinking: true }
    ]);
  };

  const handleApprove = () => {
    console.log("Approved");

    if (ws.current) {
      ws.current.close();
      console.log("WebSocket Closed");
    }

    navigate("/test");
  };

  return (
    <div className="chat-box-job">
      <div className="chat-history-job2" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message-wrapper ${chat.role}`}>
            {chat.role === "assistant" && (
              <img src="/bot.png" alt="Bot Icon" className="chat-icon" />
            )}
            <div className={`chat-message-job ${chat.role === "assistant" && index !== 0 ? "with-approve" : ""}`}>
              <div>{parseFormattedText(chat.content)}</div>
              {chat.role === "assistant" && chat.showApprove && (
                <button className="approve-button" onClick={handleApprove}>
                  Approve
                </button>
              )}
            </div>
            {chat.role === "user" && (
              <img src="/user.png" alt="User Icon" className="chat-icon" />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit}>
        <textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onInput={autoResizeChat}
          placeholder="Enter your changes here..."
          className="chat-input"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default RightPanel;
