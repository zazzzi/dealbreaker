import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useWebSocket from "../utils/useWebSockets";
import Button from "../components/ui/button";

const Session = ({ roomId: propRoomId }: { roomId: string }) => {
  // Get roomId from URL params if provided, otherwise use the prop
  const { roomId: urlRoomId } = useParams();
  const roomId = urlRoomId || propRoomId;
  const navigate = useNavigate();
  
  const { messages, sendMessage, connected } = useWebSocket(roomId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Room: {roomId}</h2>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="ml-4"
            >
              Leave Room
            </Button>
          </div>
        </div>

        {/* Messages Box */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-inner">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No messages yet...</p>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded mb-2 text-left ${
                  msg.isSystem 
                    ? 'bg-gray-700 italic text-gray-300 text-sm' 
                    : 'bg-gray-700'
                }`}
              >
                {msg.text}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={!connected}
          />
          <Button
            variant="secondary"
            onClick={handleSend}
            disabled={!connected}
          >
            Send
          </Button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Share this room ID with others: <span className="font-mono bg-gray-800 px-2 py-1 rounded">{roomId}</span></p>
        </div>
      </div>
    </div>
  );
};

export default Session;