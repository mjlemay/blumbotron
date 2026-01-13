import { useExperienceStore } from '../stores/experienceStore';
import { useGameStore } from '../stores/gamesStore';
import DisplayTable from './displayTable';
import ThemeInjector from './themeInjector';
import { useEffect, useState } from 'react';

function ViewDisplay() {
  const { experience } = useExperienceStore();
  const { games } = useGameStore();
  const [gameFromUrl, setGameFromUrl] = useState<string | undefined>();
  const [isValidGame, setIsValidGame] = useState<boolean>(true);

  // Get game from URL parameters and validate it exists
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    if (gameParam) {
      // Validate that the game exists in the store
      const gameExists = games.some(g => g.snowflake === gameParam);
      if (gameExists) {
        setGameFromUrl(gameParam);
        setIsValidGame(true);
      } else {
        setIsValidGame(false);
      }
    }
  }, [games]);

  // Use game from URL if available, otherwise fall back to experience store
  const game = gameFromUrl || experience.selected?.game?.snowflake || undefined;

  // Show error for invalid game parameter
  if (!isValidGame) {
    return (
      <div className="w-full h-full bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Invalid Game</h1>
          <p className="text-gray-400">The requested game could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black text-white">
      <ThemeInjector game={game} />
      <DisplayTable game={game} fetchIntervalSeconds={5} isFullScreen={true} />
    </div>
  );
}

export default ViewDisplay; 