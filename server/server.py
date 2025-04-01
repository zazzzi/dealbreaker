from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from collections import defaultdict
import random
import asyncio
import json
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOMS_FILE = "rooms.json"

def load_rooms():
    if os.path.exists(ROOMS_FILE):
        with open(ROOMS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_rooms(rooms):
    with open(ROOMS_FILE, "w") as f:
        json.dump(rooms, f)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)
        self.room_states: Dict[str, Dict] = load_rooms()

    async def connect(self, room_id: str, websocket: WebSocket):
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if websocket in self.active_connections.get(room_id, []):
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id: str, message: Dict):
        for connection in self.active_connections.get(room_id, []):
            await connection.send_json(message)

    def save(self):
        save_rooms(self.room_states)

manager = ConnectionManager()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    user_joined = False
    await websocket.accept()

    try:
        try:
            initial_data = await asyncio.wait_for(websocket.receive_json(), timeout=5)
        except asyncio.TimeoutError:
            await websocket.send_json({
                "type": "ERROR",
                "message": "No message received after connection."
            })
            await websocket.close()
            return

        if initial_data.get("type") != "USER_JOINED":
            await websocket.send_json({
                "type": "ERROR",
                "message": "First message must be USER_JOINED."
            })
            await websocket.close()
            return

        intent = initial_data.get("intent")
        username = initial_data.get("username", "Anonymous")
        print(f"INTENT RECEIVED: {intent} | ROOM: {room_id}")

        if intent == "create":
            if room_id in manager.room_states:
                await websocket.send_json({
                    "type": "ERROR",
                    "message": f"Room '{room_id}' already exists."
                })
                await websocket.close()
                return
            manager.active_connections[room_id] = []
            manager.room_states[room_id] = {
                "players": [],
                "player_prompts": {},
                "ready_players": [],
                "draw_pile": [],
                "turn_index": 0
            }
            manager.save()

        elif intent == "join":
            if room_id not in manager.room_states:
                await websocket.send_json({
                    "type": "ERROR",
                    "message": f"Room '{room_id}' does not exist."
                })
                await websocket.close()
                return

        else:
            await websocket.send_json({
                "type": "ERROR",
                "message": f"Invalid intent: '{intent}'"
            })
            await websocket.close()
            return

        await manager.connect(room_id, websocket)
        user_joined = True

        state = manager.room_states[room_id]
        if username not in state["players"]:
            state["players"].append(username)

        manager.save()

        for player, prompts in state["player_prompts"].items():
            for prompt in prompts:
                await websocket.send_json({
                    "type": "PROMPT_RECEIVED",
                    "from": player,
                    "count": 1,
                    "prompt": prompt
                })

        await manager.broadcast(room_id, {
            "type": "ROOM_STATE",
            "players": state["players"],
            "currentTurn": state["players"][state["turn_index"]] if state["players"] else None
        })

        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "NEW_PROMPTS":
                prompts = data["prompts"]
                room = manager.room_states[room_id]
                room["player_prompts"].setdefault(username, []).extend(prompts)
                manager.save()

                for prompt in prompts:
                    await manager.broadcast(room_id, {
                        "type": "PROMPT_RECEIVED",
                        "from": username,
                        "count": 1,
                        "prompt": prompt
                    })

            elif message_type == "PLAYER_READY":
                room = manager.room_states[room_id]
                if username not in room["ready_players"]:
                    room["ready_players"].append(username)

                manager.save()

                if set(room["players"]) == set(room["ready_players"]):
                    final_prompts = []
                    for plist in room["player_prompts"].values():
                        final_prompts.extend(plist)
                    random.shuffle(final_prompts)
                    room["draw_pile"] = final_prompts
                    manager.save()

                    await manager.broadcast(room_id, {
                        "type": "ALL_READY",
                        "drawPileSize": len(final_prompts)
                    })
                else:
                    await manager.broadcast(room_id, {
                        "type": "PLAYER_READY",
                        "username": username,
                        "readyCount": len(room["ready_players"]),
                        "totalPlayers": len(room["players"])
                    })

            elif message_type == "DRAW_PROMPT":
                room = manager.room_states[room_id]
                if room["draw_pile"]:
                    drawn = room["draw_pile"].pop(0)
                    manager.save()
                    await websocket.send_json({
                        "type": "PROMPT_DRAWN",
                        "prompt": drawn
                    })
                else:
                    await websocket.send_json({
                        "type": "NO_PROMPTS_LEFT"
                    })

            elif message_type == "NEXT_TURN":
                room = manager.room_states[room_id]
                if room["players"]:
                    room["turn_index"] = (room["turn_index"] + 1) % len(room["players"])
                    manager.save()
                    await manager.broadcast(room_id, {
                        "type": "TURN_CHANGED",
                        "currentTurn": room["players"][room["turn_index"]]
                    })

    except WebSocketDisconnect:
        if user_joined:
            manager.disconnect(room_id, websocket)
        if not manager.active_connections.get(room_id):
            manager.active_connections.pop(room_id, None)
            print(f"Room {room_id} closed due to no active connections.")
