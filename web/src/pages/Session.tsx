import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import toast from "react-hot-toast";
import useWebSocket from "../utils/useWebSockets";
import Button from "../components/ui/button";

interface Prompt {
	id: string;
	text: string;
	from: string;
}

const Session = ({ roomId: propRoomId }: { roomId: string }) => {

	const { roomId: urlRoomId } = useParams();
	const roomId = urlRoomId || propRoomId;
	const navigate = useNavigate();

	const [roomInfo, setRoomInfo] = useState<{
		players: string[];
		currentTurn: string | null;
	} | null>(null);

	const [searchParams, setSearchParams] = useSearchParams();
	const [intent, setIntent] = useState(searchParams.get("intent") || "join");
	const username = searchParams.get("username") || "Anonymous";

	const handleIncomingMessage = useCallback(
		(msg: any) => {
			if (msg.type === "PLAYER_READY") {
				setReadyCount(msg.readyCount);
				setTotalPlayers(msg.totalPlayers);
			}
			if (msg.type === "ALL_READY") {
				console.log("Everyone is ready!");
			}
			if (msg.type === "PROMPT_RECEIVED") {
				const prompt = msg.prompt;

				if (!prompt?.id || !prompt?.text || !prompt?.from) return;

				const promptObj: Prompt = {
					id: prompt.id,
					text: prompt.text,
					from: prompt.from,
				};

				setAllSubmittedPrompts((prev) => [...prev, promptObj]);

				if (prompt.from === username) {
					setMyPrompts((prev) => [...prev, promptObj]);
				}
			}

			if (msg.type === "EXISTING_PROMPTS") {
				const received = msg.prompts.map((p: any) => ({
					id: p.id || Date.now().toString(),
					text: p.text,
					from: p.from,
				}));
				setAllSubmittedPrompts((prev) => [...prev, ...received]);
			}

			if (msg.type === "ROOM_STATE") {
				setRoomInfo({
					players: msg.players,
					currentTurn: msg.currentTurn,
				});
			}
			if (msg.type === "PROMPT_DELETED") {
				setAllSubmittedPrompts((prev) =>
					prev.filter((p) => p.id !== msg.promptId)
				);
			}
			if (msg.type === "ERROR") {
				toast.error(msg.message);
				navigate("/");
			}
		},
		[navigate]
	);

	const { messages, sendMessage, connected } = useWebSocket(
		roomId,
		username,
		intent,
		handleIncomingMessage
	);

	const [input, setInput] = useState("");
	const [allSubmittedPrompts, setAllSubmittedPrompts] = useState<Prompt[]>([]);
	const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
	const [hasJoined, setHasJoined] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [readyCount, setReadyCount] = useState(0);
	const [totalPlayers, setTotalPlayers] = useState(1);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (connected && !hasJoined) {
			sendMessage({
				type: "USER_JOINED",
				username,
				intent,
			});
			setHasJoined(true);
			if (intent === "create") {
				// Swap URL and internal state to `join` to avoid re-create on refresh
				searchParams.set("intent", "join");
				setSearchParams(searchParams, { replace: true });
				setIntent("join");
			}
		}
	}, [
		connected,
		hasJoined,
		sendMessage,
		username,
		intent,
		searchParams,
		setSearchParams,
	]);

	// Clear state when roomId changes or when reconnecting
	useEffect(() => {
		setAllSubmittedPrompts([]);
		setMyPrompts([]);
		setRoomInfo(null);
		setReadyCount(0);
		setTotalPlayers(1);
		setHasJoined(false);
	}, [roomId]);

	const handleSend = () => {
		if (!input.trim()) return;

		sendMessage({
			type: "NEW_PROMPTS",
			username,
			prompts: [input],
		});

		setInput(""); // clear input
	};

	const handleDeletePrompt = (promptId: string) => {
		// Remove prompt from the local state (UI update)
		setMyPrompts((prev) => prev.filter((p) => p.id !== promptId));
		setAllSubmittedPrompts((prev) => prev.filter((p) => p.id !== promptId));

		// Broadcast the deletion to the server
		sendMessage({
			type: "DELETE_PROMPT",
			username,
			promptId,
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex flex-row-reverse items-center gap-[64px] justify-center min-h-screen p-4 text-white bg-gray-950">
			<div className="p-[2rem] rounded-2xl w-full bg-gray-900 max-w-3xl shadow-md">
				{roomInfo && (
					<div className="mt-4">
						<h4 className="mb-1 text-sm font-semibold text-white">
							Room State
						</h4>
						<pre className="p-2 text-xs text-gray-300 bg-gray-800 rounded">
							{JSON.stringify(roomInfo, null, 2)}
						</pre>
					</div>
				)}
				<h3 className="mb-2 text-lg font-semibold text-white">
					All Submitted Prompts (Debug)
				</h3>
				{allSubmittedPrompts.length === 0 ? (
					<p className="text-sm text-gray-400">No prompts submitted yet.</p>
				) : (
					<ul className="space-y-1 text-sm text-white list-disc list-inside">
						{allSubmittedPrompts.map((p) => (
							<li key={p.id}>
								[{p.from}] {p.text}{" "}
								{/* Accessing the text properties correctly */}
							</li>
						))}
					</ul>
				)}
			</div>

			<div className="w-full max-w-3xl p-6 bg-gray-900 shadow-xl rounded-2xl">
				<div className="flex flex-col gap-[24px] items-center justify-between mb-6">
					<h2 className="text-2xl font-semibold">Room: {roomId}</h2>
					<div className="flex items-center gap-2">
						<div className="flex flex-row-reverse items-center gap-2">
							<span
								className={`w-3 h-3 rounded-full ${
									connected ? "bg-green-500" : "bg-red-500"
								}`}
							></span>
							<span>{connected ? "Connected" : "Disconnected"}</span>
						</div>
						<Button
							variant="secondary"
							onClick={() => navigate("/")}
							className="ml-4"
						>
							Leave Room
						</Button>
					</div>
				</div>

				<div className="p-4 mb-4 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-inner h-96">
					{myPrompts.length > 0 && (
						<div className="mb-4">
							<p className="mb-1 text-sm text-gray-400">
								Your submitted prompts:
							</p>
							<ul className="space-y-1">
								{myPrompts.map((prompt) => (
									<li
										key={prompt.id}
										className="flex items-center justify-between px-3 py-1 text-sm text-white bg-gray-700 rounded"
									>
										<span>{prompt.text}</span>
										<button
											className="ml-4 text-red-400 hover:text-red-200"
											onClick={() => {
												setMyPrompts((prev) =>
													prev.filter((p) => p.id !== prompt.id)
												);
												setAllSubmittedPrompts((prev) =>
													prev.filter((p) => p.id !== prompt.id)
												);
												handleDeletePrompt(prompt.id);
											}}
										>
											&times;
										</button>
									</li>
								))}
							</ul>
						</div>
					)}

					{messages.map((msg, idx) => {
						if (
							["PROMPT_RECEIVED", "ROOM_STATE", "PROMPT_DELETED"].includes(
								msg.type
							)
						)
							return null;
						return (
							<div key={idx} className="p-2 mb-2 text-sm bg-gray-700 rounded">
								<p className="italic text-gray-400">[{msg.type}]</p>
								<pre className="text-white whitespace-pre-wrap">
									{JSON.stringify(msg.data, null, 2)}
								</pre>
							</div>
						);
					})}

					<div ref={messagesEndRef} />
				</div>

				<div className="flex gap-2">
					<input
						type="text"
						className="flex-1 p-2 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyPress}
						placeholder="Enter a prompt here..."
						disabled={!connected}
					/>
					<Button variant="primary" onClick={handleSend} disabled={!connected}>
						Send
					</Button>
				</div>

				<div className="mt-4 text-sm text-gray-400">
					<p>
						Share this room ID with others:{" "}
						<span className="px-2 py-1 font-mono bg-gray-800 rounded">
							{roomId}
						</span>
					</p>
				</div>
			</div>
		</div>
	);

};

export default Session;
