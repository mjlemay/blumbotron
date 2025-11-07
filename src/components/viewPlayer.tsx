import { useShallow } from 'zustand/react/shallow';
import { useExperienceStore } from '../stores/experienceStore';
import { useGameStore } from '../stores/gamesStore';
import { useRosterStore } from '../stores/rostersStore';
import { usePlayerStore } from '../stores/playersStore';
import { Separator } from '@radix-ui/react-separator';
import { PersonIcon } from '@radix-ui/react-icons';
import { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import * as ScrollArea from '@radix-ui/react-scroll-area';

function ViewPlayer() {
  const { selected, setExpView, setExpSelected } = useExperienceStore(
    useShallow((state) => ({ 
      selected: state.experience.selected, 
      setExpView: state.setExpView,
      setExpSelected: state.setExpSelected
    }))
  );
  
  const { games, fetchGames } = useGameStore();
  const { rosters, fetchRosters } = useRosterStore();
  const { players, fetchPlayers } = usePlayerStore();
  
  const [playerImageSrc, setPlayerImageSrc] = useState<string>('');
  
  // Get the fresh player data from the players store instead of just the selected state
  const selectedPlayerFromStore = selected?.player || null;
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerFromStore) return null;
    // Find the updated player data from the players store
    return players.find(p => p.snowflake === selectedPlayerFromStore.snowflake) || selectedPlayerFromStore;
  }, [players, selectedPlayerFromStore]);
  
  const { name = '', id = '', snowflake, created_at, updated_at } = selectedPlayer || {};

  // Load player image
  const loadPlayerImage = async (imageFileName?: string) => {
    const fileName = imageFileName || (selectedPlayer?.data as any)?.avatarImage;
    if (fileName) {
      try {
        // If it's already a data URL, use it directly
        if (fileName.startsWith('data:')) {
          setPlayerImageSrc(fileName);
          return;
        }
        
        // Otherwise, load from Tauri backend
        const dataUrl = await invoke('get_background_image_data', { fileName: fileName }) as string;
        setPlayerImageSrc(dataUrl);
      } catch (error) {
        console.error('Failed to load player image:', fileName, error);
        setPlayerImageSrc('');
      }
    } else {
      setPlayerImageSrc('');
    }
  };

  // Fetch data when component mounts or player changes
  useEffect(() => {
    if (selectedPlayerFromStore) {
      fetchGames();
      fetchRosters();
      fetchPlayers(); // Ensure we have fresh player data
    }
  }, [selectedPlayerFromStore, fetchGames, fetchRosters, fetchPlayers]);

  // Load player image when selectedPlayer data changes (including updates)
  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerImage();
    }
  }, [selectedPlayer]);

  // Find games where this player can participate
  const availableGames = games.filter(game => {
    // If game has no roster, all players can participate
    if (!game.roster) {
      return true;
    }
    
    // Find the roster for this game
    const gameRoster = rosters.find(roster => roster.snowflake === game.roster);
    if (!gameRoster) {
      return true; // If roster doesn't exist, assume all players can participate
    }
    
    // Check if player is in the allow list (or allow list is empty)
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // If player is explicitly denied, they can't participate
    if (gameRoster.deny && gameRoster.deny.includes(playerSnowflake)) {
      return false;
    }
    
    // If there's an allow list and player is not in it, they can't participate
    if (gameRoster.allow && gameRoster.allow.length > 0 && !gameRoster.allow.includes(playerSnowflake)) {
      return false;
    }
    
    return true;
  });

  // Find games where this player is banned
  const bannedGames = games.filter(game => {
    if (!game.roster) {
      return false; // Can't be banned from games with no roster
    }
    
    const gameRoster = rosters.find(roster => roster.snowflake === game.roster);
    if (!gameRoster) {
      return false;
    }
    
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is banned if they're in the deny list
    if (gameRoster.deny && gameRoster.deny.includes(playerSnowflake)) {
      return true;
    }
    
    // Player is also effectively banned if there's an allow list and they're not in it
    if (gameRoster.allow && gameRoster.allow.length > 0 && !gameRoster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    return false;
  });

  // Function to navigate to a game's detail page
  const navigateToGame = (game: any) => {
    setExpSelected({ game });
    setExpView('game');
  };

  // Find rosters where this player is included
  const includedRosters = rosters.filter(roster => {
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is included if they're in the allow list or if allow list is empty and they're not in deny list
    if (roster.allow && roster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    // If no allow list, player is included unless they're in deny list
    if (!roster.allow || roster.allow.length === 0) {
      return !roster.deny || !roster.deny.includes(playerSnowflake);
    }
    
    return false;
  });

  // Find rosters where this player is banned
  const bannedRosters = rosters.filter(roster => {
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is banned if they're in the deny list
    if (roster.deny && roster.deny.includes(playerSnowflake)) {
      return true;
    }
    
    // Player is also effectively banned if there's an allow list and they're not in it
    if (roster.allow && roster.allow.length > 0 && !roster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    return false;
  });

  return (
    <div key={`${id}-${name}`} className="h-[calc(100vh-8rem)] overflow-hidden">
      <div
        className="
          flex 
          flex-col
          h-full
          min-w-[calc(100vw-8rem)]
          bg-slate-600
          justify-start
          rounded-lg
          p-2 m-2
          pt-4
          shadow-lg
          overflow-y-auto
        "
      >
        <div className="w-full rounded bg-slate-700 p-4 mb-4 shadow-lg">
          <div className="flex flex-row items-center gap-4 mb-2">
            {/* Player Image */}
            <div className="relative">
              {playerImageSrc ? (
                <img
                  src={playerImageSrc}
                  alt={`${name} avatar`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center border-2 border-slate-500">
                  <PersonIcon className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Player Info */}
            <div>
              <h2 className="text-3xl font-thin flex flex-row items-center gap-2">
                {name}
                {snowflake && <span className="text-2xl text-slate-400">#{snowflake}</span>}
              </h2>
            </div>
          </div>
          <div className="w-full text-slate-400 flex flex row items-center gap-2 justify-start">
            {created_at && (
              <span>
                <label className="text-slate-500">Created</label> {created_at}
              </span>
            )}
            {created_at && updated_at && (
              <Separator className="w-[1px] h-4 bg-slate-500" orientation="vertical" decorative />
            )}
            {updated_at && (
              <span>
                <label className="text-slate-500">Updated</label> {updated_at}
              </span>
            )}
          </div>
        </div>
        <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-hidden mb-2">
          <ScrollArea.Viewport className="h-full w-full rounded p-4">
            <div className="w-full">
              <h3 className="text-2xl font-thin pl-2 pb-2">Included in Games</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {availableGames.length > 0 ? (
                  availableGames.map(game => (
                    <div 
                      key={game.snowflake || game.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                      onClick={() => navigateToGame(game)}
                    >
                      <span className="text-white font-medium">{game.name}</span>
                      {game.roster && (
                        <span className="text-slate-300 text-sm ml-2">
                          (via roster)
                        </span>
                      )}
                      {!game.roster && (
                        <span className="text-green-300 text-sm ml-2">
                          (open to all)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No games found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Games</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {bannedGames.length > 0 ? (
                  bannedGames.map(game => (
                    <div 
                      key={game.snowflake || game.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                      onClick={() => navigateToGame(game)}
                    >
                      <span className="text-white font-medium">{game.name}</span>
                      <span className="text-red-200 text-sm ml-2">
                        (restricted)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No games found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Included in Rosters</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {includedRosters.length > 0 ? (
                  includedRosters.map(roster => (
                    <div 
                      key={roster.snowflake || roster.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                    >
                      <span className="text-white font-medium">{roster.name}</span>
                      {roster.allow && roster.allow.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-blue-200 text-sm ml-2">
                          (explicitly allowed)
                        </span>
                      )}
                      {(!roster.allow || roster.allow.length === 0) && (
                        <span className="text-blue-200 text-sm ml-2">
                          (default access)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No rosters found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Rosters</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {bannedRosters.length > 0 ? (
                  bannedRosters.map(roster => (
                    <div 
                      key={roster.snowflake || roster.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                    >
                      <span className="text-white font-medium">{roster.name}</span>
                      {roster.deny && roster.deny.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-red-200 text-sm ml-2">
                          (explicitly denied)
                        </span>
                      )}
                      {roster.allow && roster.allow.length > 0 && !roster.allow.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-red-200 text-sm ml-2">
                          (not in allow list)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No rosters found.</p>
                )}
              </div>
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex touch-none select-none bg-gray-700/75 p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="relative flex-1 bg-gray-500 rounded-[10px] before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar
            className="flex touch-none select-none bg-slate-700/75 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-slate-600/75 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-slate-500 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-slate-700/50" />
        </ScrollArea.Root>
      </div>
    </div>
  );
}

export default ViewPlayer;
