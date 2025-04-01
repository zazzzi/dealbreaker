import { useNavigate } from "react-router-dom";
import Button from "../components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCreateSession = () => {
    const roomId = prompt("Enter a room ID:");
    navigate(`/session/${roomId}`);
  };

  const handleJoinSession = () => {
    const roomId = prompt("Enter the room ID to join:");
    if (roomId) {
      navigate(`/session/${roomId}`);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="bg-primary p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg text-center m-auto">
        <h1 className="text-[32px] font-bold mb-4 sm:mb-6">
          Welcome to Dealbreaker
        </h1>
        <p className="text-md mb-6 sm:mb-8">
          Create or join a session to get started
        </p>

        <div className="flex flex-col gap-2 justify-center">
          <div className="">
            <Button
              variant="primary"
              onClick={handleCreateSession}
              className="py-3 text-2 px-8 min-w-[200px] sm:min-w-[240px]"
            >
              Create Session
            </Button>
          </div>
          <div>
            <Button
              variant="secondary"
              onClick={handleJoinSession}
              className="py-3 text-lg px-8 min-w-[200px] sm:min-w-[240px]"
            >
              Join Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
