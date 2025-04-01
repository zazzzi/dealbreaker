import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Session from "./pages/Session";
import JoinGame from "./pages/JoinGame";
import { Toaster } from "react-hot-toast";
import "./index.css";

const App = () => {
	return (
		<>
			<Toaster position="top-right" />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LandingPage />} />
					<Route path="/session/:roomId" element={<Session roomId="" />} />
					<Route path="/create" element={<JoinGame />} />
					<Route path="/join" element={<JoinGame />} />

					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</BrowserRouter>
		</>
	);
};

export default App;
