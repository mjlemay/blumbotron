import { useEffect, useState } from 'react';
import DisplayTable from './displayTable';
import { usePlayerStore } from '../stores/playersStore';
import { useGameStore } from '../stores/gamesStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';
import { listen } from '@tauri-apps/api/event';

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
  const { fetchUniqueScoresByGame, gameScores } = useScoreStore();
  
  // gameScores is accessed to ensure the wrapper re-renders when scores change
  console.log('DisplayTableWrapper render, gameScores keys:', Object.keys(gameScores));

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
    
    // Listen for score updates from other windows
    const setupEventListener = async () => {
      try {
        const unlisten = await listen('score-updated', (event) => {
          console.log('DisplayTableWrapper: Received score-updated event:', event.payload);
          const payload = event.payload as { gameId: string; sourceWindowId: string };
          
          // Get our window ID (if we have one)
          const ourWindowId = (window as any).__blumbotronWindowId;
          
          // Ignore events from our own window to prevent self-refresh
          if (payload.sourceWindowId === ourWindowId) {
            console.log('DisplayTableWrapper: Ignoring event from same window');
            return;
          }
          
          // If this event is for our game, refresh the scores
          if (payload.gameId === game) {
            console.log('DisplayTableWrapper: Refreshing scores for game from other window:', game);
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

  return <DisplayTable game={game} fetchIntervalSeconds={fetchIntervalSeconds} />;
}