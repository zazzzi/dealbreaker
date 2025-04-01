import React, { useState } from "react";
import useWebSocket from "../utils/useWebSockets";

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const { messages, sendMessage } = useWebSocket(roomId);
  const [input, setInput] = useState("");

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Room {roomId}</h2>

      {/* Messages Box */}
      <div className="h-64 overflow-y-auto p-4 bg-gray-800 rounded-lg mb-4 border border-gray-700 shadow-inner">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No messages yet...</p>
        ) : (
          messages.map((msg, idx) => (
            <p key={idx} className="bg-gray-700 p-2 rounded mb-2 text-left">
              {msg}
            </p>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600 transition"
          onClick={() => {
            sendMessage(input);
            setInput("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
