from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        # Track active connections by room
        self.active_rooms: Dict[str, List[WebSocket]] = {}
        # Store messages by room
        self.room_messages: Dict[str, List[str]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        
        # Initialize room if it doesn't exist
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []
            self.room_messages[room_id] = []
            
        # Add connection to room
        self.active_rooms[room_id].append(websocket)
        
        # Send message history to new connection
        for message in self.room_messages[room_id]:
            await websocket.send_text(message)

    def disconnect(self, websocket: WebSocket, room_id: str):
        # Remove connection from room
        if room_id in self.active_rooms:
            if websocket in self.active_rooms[room_id]:
                self.active_rooms[room_id].remove(websocket)
            
            # If room is empty, clean up
            if len(self.active_rooms[room_id]) == 0:
                del self.active_rooms[room_id]
                del self.room_messages[room_id]
                print(f"Room {room_id} has been closed - all users left")

    async def broadcast_to_room(self, message: str, room_id: str):
        # Store message in room history
        if room_id in self.room_messages:
            self.room_messages[room_id].append(message)
            
            # Keep track of disconnected clients to remove later
            disconnected_clients = []
            
            # Send to all connections in the room
            for connection in self.active_rooms[room_id]:
                try:
                    await connection.send_text(message)
                except WebSocketDisconnect:
                    # Mark client as disconnected
                    disconnected_clients.append(connection)
                except Exception as e:
                    # Handle other potential errors
                    print(f"Error sending to client: {e}")
                    disconnected_clients.append(connection)
            
            # Remove disconnected clients
            for client in disconnected_clients:
                self.active_rooms[room_id].remove(client)
                
            # If room is now empty, clean up
            if len(self.active_rooms[room_id]) == 0:
                del self.active_rooms[room_id]
                del self.room_messages[room_id]
                print(f"Room {room_id} has been closed - all users left")

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        # Send room join notification
        await manager.broadcast_to_room(f"System: New user joined room {room_id}", room_id)
        
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_to_room(f"User: {data}", room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Only broadcast if the room still exists
        if room_id in manager.active_rooms:
            await manager.broadcast_to_room(f"System: A user has left the room", room_id)

@app.get("/")
async def get():
    return {"message": "WebSocket server is running"}