import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";

const LandingPage = () => {
	const navigate = useNavigate();


	const handleCreateSession = () => {
		navigate("/create");
	};

	const handleJoinSession = () => {
		navigate("/join");
	};

	return (
		<div className="flex items-center justify-center min-h-screen p-6 text-white bg-gray-950">
			<div className="w-full max-w-2xl p-8 text-center bg-gray-900 shadow-xl rounded-2xl">
				<h1 className="mb-6 text-3xl font-bold">Welcome to Dealbreaker</h1>
				<p className="mb-8 text-lg">Create or join a session to get started</p>

				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Button variant="primary" onClick={handleCreateSession}>
						Create Session
					</Button>

					<Button variant="secondary" onClick={handleJoinSession}>
						Join Session
					</Button>
				</div>
			</div>
		</div>
	);

};

export default LandingPage;
