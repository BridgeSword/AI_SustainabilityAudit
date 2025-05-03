import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RightPanel.css";
import NavBar from "../NavBar/NavBar.jsx"; 
import { useGlobalWebSocket } from "../context/WebSocketContext.jsx";

const RightPanel = ({ formData }) => {
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Hello! How can I help you today? Please first fill out the info in the left part!"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isWaitingReport, setIsWaitingReport] = useState(false); 
  const [isReportGenerating, setIsReportGenerating] = useState(false); 


  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const chatHistoryRef = useRef(null);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  const globalWs = useGlobalWebSocket();

  useEffect(() => {
    if (!formData) return;
    if (!globalWs) return; 

    if (globalWs.readyState === WebSocket.OPEN) {
      sendPlanData();
    } else {
      globalWs.onopen = () => {
        console.log("Global WebSocket Connected from RightPanel");
        sendPlanData();
      };
    }
  }, [formData, globalWs]);

  const sendPlanData = () => {
    if (!globalWs) return;
    console.log("Sending plan data via global WS...");

    globalWs.send(
      JSON.stringify({
        user_id: sessionStorage.getItem("user_id"),
        standard: formData.standard,
        goal: formData.carboGoal,
        plan: formData.carbonPlan,
        action: formData.carbonAction,
        company: "Cornell University",
        device: "cpu",
        genai_model: "ollama-llama3.2"
      })
    );

    setChatHistory((prev) => [
      ...removeApproves(prev),
      { role: "assistant", content: "Generating plan...", isThinking: true }
    ]);


    setProgress(0);
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    const start = Date.now();
    const total = 10000; 

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressTimerRef.current);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!globalWs) return;

    const handleMessage = (event) => {
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
        }


        if (
          receivedData.task_status === "SUCCESS" &&
          receivedData.response &&
          typeof receivedData.response === "object"
        ) {
  
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }
          setProgress(100)
          ;

          const resultStr = Object.entries(receivedData.response)
            .map(([k, v]) => `**${k}**\n${v}`)
            .join("\n\n");

          newHistory[newHistory.length - 1] = {
            role: "assistant",
            content: "",
            fullContent: resultStr,
            isThinking: false,
            showApprove: !isWaitingReport
          };

          if (isWaitingReport) {
            setIsWaitingReport(false);

            if (isReportGenerating) {
              setIsReportGenerating(false);
            }

            navigate("/test", {
              state: {
                waitForSocket: true,
                loading: false,
                reportData: resultStr
              }
            });
          }
        }

        return newHistory;
      });
    };

    globalWs.addEventListener("message", handleMessage);
    return () => {
      globalWs.removeEventListener("message", handleMessage);
    };
  }, [globalWs, isWaitingReport, isReportGenerating, navigate]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const removeApproves = (history) => {
    return history.map((chat) => ({
      ...chat,
      showApprove: false
    }));
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

  const autoResizeChat = (e) => {
    const el = e.target;
    el.style.height = "auto";
    const style = window.getComputedStyle(el);
    let lineHeight = style.lineHeight;
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

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput.trim() };
    setChatHistory((prev) => [...removeApproves(prev), userMessage]);
    setChatInput("");

    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify({ message: chatInput.trim() }));
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "5vh";
    }

    setChatHistory((prev) => [
      ...prev,
      { role: "assistant", content: "⏳ Processing...", isThinking: true }
    ]);
  };

  const handleApprove = () => {
    navigate("/test", {
      state: {
        proceed: true
      }
    });
  };

  
  const ProgressBar = ({ progress }) => {
    return (
      <div
        style={{
          width: "100%",         
          backgroundColor: "#eee",
          marginTop: "8px",
          height: "12px",        
          borderRadius: "6px",   
          overflow: "hidden"     
        }}
      >
        <div
          style={{
            width: progress + "%",
            height: "100%",
            backgroundColor: "#128C7E",
            transition: "width 1s linear",
            borderRadius: "1px" 
          }}
        />
      </div>
    );
  };

  return (
    <>
      <NavBar />
      {isReportGenerating ? (
        <div className="full-loading-container">
          <h2>Generating final report...</h2>
          <p>Please wait while the system finalizes the data</p>
        </div>
      ) : (
        <div className="chat-box-job">
          <div className="chat-history-job2" ref={chatHistoryRef}>
            {chatHistory.map((chat, index) => {
              const isAssistant = chat.role === "assistant";
              const isGenerating =
                chat.content?.startsWith("Generating plan...") ||
                chat.content?.startsWith("🤔") ||
                chat.content?.startsWith("⏳");

              return (
                <div key={index} className={`chat-message-wrapper ${chat.role}`}>
                  {isAssistant && <img src="/bot.png" alt="Bot Icon" className="chat-icon" />}
                  <div className={`chat-message-job ${isAssistant && index !== 0 ? "with-approve" : ""}`}>
                    <div>
                      {parseFormattedText(chat.content || chat.fullContent || "")}
                      {isAssistant && isGenerating && <ProgressBar progress={progress} />}
                    </div>
                    {isAssistant && chat.showApprove && (
                      <button className="approve-button" onClick={handleApprove}>
                        Approve
                      </button>
                    )}
                  </div>
                  {chat.role === "user" && (
                    <img src="/user.png" alt="User Icon" className="chat-icon" />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleChatSubmit}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onInput={autoResizeChat}
              placeholder="Enter your changes here..."
              className="chat-input"
              ref={textareaRef}
            ></textarea>
            <button type="submit">Submit</button>
          </form>

          {isWaitingReport && (
            <div className="waiting-indicator">
              <p>Generating report, please wait...</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RightPanel;
