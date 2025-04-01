import { useEffect, useState, useCallback } from "react";

interface Message {
  text: string;
  isSystem: boolean;
  timestamp: number;
}

const useWebSocket = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

    ws.onopen = () => {
      console.log(`Connected to room: ${roomId}`);
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const messageText = event.data;
      const isSystem = messageText.startsWith("System:");
      
      const newMessage: Message = {
        text: messageText,
        isSystem,
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, newMessage]);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      console.log("Closing WebSocket connection");
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  const sendMessage = useCallback((message: string) => {
    if (socket?.readyState === WebSocket.OPEN && message.trim()) {
      socket.send(message);
    }
  }, [socket]);

  return { messages, sendMessage, connected };
};

export default useWebSocket;