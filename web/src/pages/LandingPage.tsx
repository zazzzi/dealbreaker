import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleCreateSession = () => {
    // Generate a unique room ID using timestamp
    const roomId = prompt('Enter the room ID to create:');
    navigate(`/session/${roomId}`);
  };

  const handleJoinSession = () => {
    // For now, prompt the user for a room ID
    const roomId = prompt('Enter the room ID to join:');
    if (roomId) {
      navigate(`/session/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Dealbreaker</h1>
        <p className="text-lg mb-8">Create or join a session to get started</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary" 
            onClick={handleCreateSession}
          >
            Create Session
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleJoinSession}
          >
            Join Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;