import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/button";

const JoinGame = () => {
	const location = useLocation();

	const [username, setUsername] = useState("");
	const [hasJoined, setHasJoined] = useState(false);

	const [roomId, setRoomId] = useState(() =>
		location.pathname === "/create" ? Date.now().toString() : ""
	);

	const navigate = useNavigate();

	const isCreating = location.pathname === "/create";

	const handleContinue = async () => {
		if (!username.trim() || !roomId.trim()) return;

		if (isCreating) {
			navigate(
				`/session/${roomId}?username=${encodeURIComponent(
					username
				)}&intent=create`
			);
		} else {
			const exists = await checkRoomExists(roomId);
			if (exists) {
				navigate(
					`/session/${roomId}?username=${encodeURIComponent(
						username
					)}&intent=join`
				);
			} else {
				toast.error(`Room "${roomId}" doesn't exist.`);
			}
		}
	};

	const checkRoomExists = (roomId: string): Promise<boolean> => {
		return new Promise((resolve) => {
			const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

			ws.onopen = () => {
				ws.send(
					JSON.stringify({
						type: "USER_JOINED",
						username: "validation-checker",
						intent: "join",
					})
				);
			};

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === "ERROR") {
					resolve(false);
					ws.close();
				} else {
					resolve(true);
					ws.close();
				}
			};

			ws.onerror = () => {
				resolve(false);
			};
		});
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-6 text-white bg-gray-950">
			<div className="w-full max-w-md p-8 text-center bg-gray-900 shadow-xl rounded-2xl">
				<h1 className="mb-6 text-2xl font-bold">
					{isCreating ? "Create a Session" : "Join a Session"}
				</h1>

				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Your name"
					className="w-full p-2 mb-4 text-white bg-gray-800 border border-gray-700 rounded"
				/>

				<input
					type="text"
					value={roomId}
					onChange={(e) => setRoomId(e.target.value)}
					placeholder="Room ID"
					className="w-full p-2 mb-6 text-white bg-gray-800 border border-gray-700 rounded"
				/>

				<Button variant="primary" onClick={handleContinue}>
					Continue
				</Button>
			</div>
		</div>
	);
};

export default JoinGame;
