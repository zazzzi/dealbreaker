import { useEffect, useState, useCallback } from "react";

interface Message {
	type: string;
	data: any;
	timestamp: number;
}

const useWebSocket = (
	roomId: string,
	username: string,
	intent: string,
	onMessage?: (data: any) => void
) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const [connected, setConnected] = useState(false);


	useEffect(() => {
		const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);


		ws.onopen = () => {
			console.log(`✅ Connected to room: ${roomId}`);
			setConnected(true);

			// Send initial USER_JOINED as first message
			ws.send(
				JSON.stringify({
					type: "USER_JOINED",
					username,
					intent,
				})
			);
		};

		ws.onmessage = (event) => {
			try {
				const parsed = JSON.parse(event.data);
				setMessages((prev) => [
					...prev,
					{ type: parsed.type, data: parsed, timestamp: Date.now() },
				]);
				if (onMessage) onMessage(parsed);
			} catch (err) {
				console.error("WebSocket parse error:", err);
			}
		};

		ws.onclose = () => {
			console.log("❌ WebSocket disconnected");
			setConnected(false);
		};

		ws.onerror = (error) => {
			console.error("🔥 WebSocket error:", error);
		};

		setSocket(ws);

		return () => {
			console.log("👋 Closing WebSocket");
			ws.close();
		};
	}, [roomId, username, intent, onMessage]);

	const sendMessage = useCallback(
		(message: object) => {
			if (socket?.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify(message));
			} else {
				console.warn("WebSocket not ready — message not sent", message);
			}
		},
		[socket]
	);

	return { messages, sendMessage, connected };
};

export default useWebSocket;
