import { useEffect, useState } from 'react';
import DisplayTable from './displayTable';
import { usePlayerStore } from '../stores/playersStore';
import { useGameStore } from '../stores/gamesStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';

type DisplayTableWrapperProps = {
  game?: string;
  fetchIntervalSeconds?: number;
};

export default function DisplayTableWrapper(props: DisplayTableWrapperProps) {
  const { game, fetchIntervalSeconds = 10 } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use stores
  const { fetchPlayers } = usePlayerStore();
  const { fetchGames } = useGameStore();
  const { fetchRosters } = useRosterStore();
  const { fetchUniqueScoresByGame } = useScoreStore();

  useEffect(() => {
    console.log('DisplayTableWrapper: Loading stores for game:', game);
    
    const loadStores = async () => {
      try {
        await Promise.all([
          fetchPlayers(),
          fetchGames(),
          fetchRosters(),
          game ? fetchUniqueScoresByGame(game) : Promise.resolve()
        ]);
        
        console.log('DisplayTableWrapper: All stores loaded successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('DisplayTableWrapper: Store loading failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadStores();
  }, [fetchPlayers, fetchGames, fetchRosters, fetchUniqueScoresByGame, game]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-center">
        <div>
          <div className="text-red-400 text-lg mb-2">Error Loading Data</div>
          <div className="text-sm text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-center">
        <div>
          <div className="text-white text-lg mb-2">Loading Game Data...</div>
          <div className="text-sm text-gray-400">Game: {game || 'No game specified'}</div>
          <div className="text-sm text-gray-400">Initializing stores...</div>
        </div>
      </div>
    );
  }

  return <DisplayTable game={game} fetchIntervalSeconds={fetchIntervalSeconds} />;
}