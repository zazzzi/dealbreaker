import React, { useState } from "react";
import ChatRoom from "./components/Room";
import './index.css';

const App = () => {
  const [roomId, setRoomId] = useState("1");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      {/* Bounding Box */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">WebSocket Chat Rooms</h1>

        {/* Room Input */}
        <div className="mb-4">
          <input
            type="text"
            className="p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none text-center w-1/2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
          />
        </div>

        {/* Chat Component */}
        <ChatRoom roomId={roomId} />
      </div>
    </div>
  );
};

export default App;
