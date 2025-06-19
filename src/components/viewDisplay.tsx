import { useExperienceStore } from '../stores/experienceStore';
import DisplayTable from './displayTable';
import { useEffect, useState } from 'react';

function ViewDisplay() {
  const { experience } = useExperienceStore();
  const [gameFromUrl, setGameFromUrl] = useState<string | undefined>();
  
  // Get game from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    if (gameParam) {
      setGameFromUrl(gameParam);
      console.log('Game from URL parameter:', gameParam);
    }
  }, []);

  // Use game from URL if available, otherwise fall back to experience store
  const game = gameFromUrl || experience.selected?.game?.snowflake || undefined;

  console.log('ViewDisplay rendering with game:', game);
  console.log('ViewDisplay - experience:', experience);
  console.log('ViewDisplay - selected game:', experience.selected?.game);
  console.log('ViewDisplay - game from URL:', gameFromUrl);

  return (
    <div className="w-full h-full bg-black text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Display Window</h1>
        <p>Game: {game || 'No game selected'}</p>
        <p>Window loaded successfully!</p>
        {gameFromUrl && <p>Game loaded from URL parameter: {gameFromUrl}</p>}
      </div>
      <DisplayTable game={game} fetchIntervalSeconds={5} isFullScreen={true} />
    </div>
  );
}

export default ViewDisplay; 