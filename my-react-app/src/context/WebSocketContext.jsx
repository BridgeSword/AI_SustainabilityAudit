import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9092/sdmarag/v1/ws/plan_generate");
    socket.onopen = () => {
      console.log("Global WebSocket Connected from Context");
    };

    setWs(socket);

    return () => {
        // socket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useGlobalWebSocket = () => {
  return useContext(WebSocketContext);
};
