type SimpleDisplayProps = {
  game?: string;
};

export default function SimpleDisplay(props: SimpleDisplayProps) {
  const { game } = props;
  
  // Mock data for testing
  const mockData = [
    { player: "Player 1", score: 1500 },
    { player: "Player 2", score: 1200 },
    { player: "Player 3", score: 1000 },
    { player: "Player 4", score: 800 },
    { player: "Player 5", score: 600 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Blumbotron Display</h1>
      <div className="text-xl mb-4">Game: {game || 'Test Game'}</div>
      
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-4 bg-gray-800 p-4 rounded-lg mb-4">
          <div className="font-bold text-center">Player</div>
          <div className="font-bold text-center">Score</div>
        </div>
        
        {mockData.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 bg-gray-700 p-3 rounded mb-2">
            <div className="text-center">{item.player}</div>
            <div className="text-center font-mono">{item.score}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-sm text-gray-400">
        This is a test display without database dependencies
      </div>
    </div>
  );
}