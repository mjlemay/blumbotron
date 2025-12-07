import ListContainer from './listContainer';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '../stores/playersStore';
import * as Menubar from '@radix-ui/react-menubar';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import PlayerListItem from './playerListItem';
import { DataItem } from '../lib/types';
import { useExperienceStore } from '../stores/experienceStore';
import SearchBar from './searchBar';

function ViewPlayers(): JSX.Element {
  const { players, loading, error, fetchPlayers } = usePlayerStore();
  const { setExpModal, setExpSelected, setExpView } = useExperienceStore();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const displayPlayers = (players: DataItem[]): DataItem[] => {
    const filteredPlayers = players.filter(player => {
      const searchLower = searchValue.toLowerCase();
      
      // Check name
      if (player.name.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check id
      if (player.id?.toString().includes(searchValue)) {
        return true;
      }
      
      // Check snowflake
      if (player.snowflake?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check alternate IDs
      if (player.data && typeof player.data === 'object') {
        const alternateIds = player.data.alternateIds;
        if (alternateIds && typeof alternateIds === 'object') {
          const alternateIdsObj = alternateIds as Record<string, unknown>;
          // Check both keys and values of alternateIds
          for (const [key, value] of Object.entries(alternateIdsObj)) {
            if (key.toLowerCase().includes(searchLower) || 
                String(value).toLowerCase().includes(searchLower)) {
              return true;
            }
          }
        }
      }
      
      return false;
    });

    return filteredPlayers.map((player, index) => {
      const firstLetter = player.name.charAt(0).toUpperCase();
      const prevFirstLetter = index > 0 ? filteredPlayers[index - 1].name.charAt(0).toUpperCase() : '';
      const newLetter = firstLetter !== prevFirstLetter ? firstLetter : null;
      const playerData = typeof player.data === 'object' ? player.data : {};
      return {
        ...player,
        data: {
          ...playerData,
          newLetter,
        },
        handleClick: () => handlePlayerSelect(player.id as unknown as number),
      };
    });
  };

  const handlePlayerSelect = (id: number) => {
    const selectedPlayer: DataItem | undefined = displayPlayers(players).find(
      (player) => id === player.id
    );
    if (selectedPlayer) {
      setExpSelected({
        player: selectedPlayer,
      });
      setExpView('player');
    }
  };

  return (
    <div className="m-2">
      <ListContainer menuBar="top" items={displayPlayers(players)} listItem={PlayerListItem} title="Players">
        <Menubar.Root className="flex rounded-md">
          <Menubar.Menu>
            <div className="flex flex-row items-center justify-center gap-1">
              <SearchBar searchValue={searchValue} updateSearchValue={setSearchValue} />
            </div>
            <Menubar.Separator className="border-r border-slate-500 mx-2" />
            <Menubar.Trigger
              className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700"
              onClick={() => setExpModal('newPlayer')}
            >
              <PlusCircledIcon width="20" height="20" /> <span>Create New Player</span>
            </Menubar.Trigger>
          </Menubar.Menu>
        </Menubar.Root>
      </ListContainer>
    </div>
  );
}

export default ViewPlayers;
