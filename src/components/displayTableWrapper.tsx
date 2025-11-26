import { useEffect, useState, useMemo } from 'react';
import DisplayTable from './displayTable';
import DisplaySlide from './displaySlide';
import { usePlayerStore } from '../stores/playersStore';
import { useGameStore } from '../stores/gamesStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';
import ThemeInjector from './themeInjector';
import { listen } from '@tauri-apps/api/event';

type DisplayTableWrapperProps = {
  game?: string;
  displayIndex?: number;
  fetchIntervalSeconds?: number;
};

export default function DisplayTableWrapper(props: DisplayTableWrapperProps) {
  const { game, fetchIntervalSeconds = 10, displayIndex } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [_, setGameData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use stores
  const { fetchPlayers } = usePlayerStore();
  const { fetchGames, games } = useGameStore();
  const { fetchRosters } = useRosterStore();
  const { fetchUniqueScoresByGame } = useScoreStore();
  
  // Determine display type from game data
  const displayType = useMemo(() => {
    const currentGame = games.find(g => g.snowflake === game);
    return currentGame?.data?.displays?.[displayIndex || 0]?.category || 'table';
  }, [games, game, displayIndex]);
  
  // Theme loading effect - runs after stores are loaded
  useEffect(() => {
    if (!game || games.length === 0 || isLoading) return;
    
    // Find the current game data
    const currentGame = games.find(g => g.snowflake === game);
    if (!currentGame?.data) return;
    setGameData(currentGame.data);
    
  }, [game, games, isLoading]);
  
  useEffect(() => {
    
    const loadStores = async () => {
      try {
        await Promise.all([
          fetchPlayers(),
          fetchGames(),
          fetchRosters(),
          game ? fetchUniqueScoresByGame(game) : Promise.resolve()
        ]);
        setIsLoading(false);
      } catch (err) {
        console.error('DisplayTableWrapper: Store loading failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadStores();
    
    // Listen for score updates from other windows
    const setupEventListener = async () => {
      try {
        const unlisten = await listen('score-updated', (event) => {
          const payload = event.payload as { gameId: string; sourceWindowId: string };
          
          // Get our window ID (if we have one)
          const ourWindowId = (window as any).__blumbotronWindowId;
          
          // Ignore events from our own window to prevent self-refresh
          if (payload.sourceWindowId === ourWindowId) {
            return;
          }
          
          // If this event is for our game, refresh the scores
          if (payload.gameId === game) {
            // Small delay to prevent flickering from rapid updates
            setTimeout(() => {
              fetchUniqueScoresByGame(game);
            }, 50);
          }
        });
        
        // Return cleanup function
        return unlisten;
      } catch (err) {
        console.warn('DisplayTableWrapper: Failed to set up event listener:', err);
        return () => {}; // Return empty cleanup function
      }
    };
    
    let cleanup: (() => void) | undefined;
    
    setupEventListener().then((unlistenFn) => {
      cleanup = unlistenFn;
    });
    
    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
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

  return (
    <>
      <ThemeInjector game={game} />
      {displayType === 'table' && (
        <DisplayTable game={game} isFullScreen={true} displayIndex={displayIndex} fetchIntervalSeconds={fetchIntervalSeconds} />
      )}
      {displayType === 'slide' && (
        <DisplaySlide game={game} displayIndex={displayIndex} />
      )}
    </>
  );
}