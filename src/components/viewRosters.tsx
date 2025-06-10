import ListContainer from './listContainer';
import { useEffect } from 'react';
import { useRosterStore } from '../stores/rostersStore';
import * as Menubar from '@radix-ui/react-menubar';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import RosterListItem from './rosterListItem';
import { RosterDataItem } from '../lib/types';
import { useExperienceStore } from '../stores/experienceStore';
import { usePlayerStore } from '../stores/playersStore';

function ViewRosters(): JSX.Element {
  const { rosters, loading, error, fetchRosters } = useRosterStore();
  const { fetchPlayers } = usePlayerStore();
  const { setExpModal, setExpSelected, setExpView } = useExperienceStore();

  useEffect(() => {
    fetchRosters();
    fetchPlayers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const displayRosters = (rosters: RosterDataItem[]): RosterDataItem[] => {
    return rosters.map((roster) => ({
      ...roster,
      handleClick: () => handleRosterSelect(roster.id as unknown as number),
    }));
  };

  const handleRosterSelect = (id: number) => {
    const selectedRoster: RosterDataItem | undefined = displayRosters(rosters).find(
      (roster) => id === roster.id
    );
    if (selectedRoster) {
      setExpSelected({
        roster: selectedRoster,
      });
      setExpView('roster');
    }
  };

  return (
    <div className="m-2">
      <ListContainer items={displayRosters(rosters)} listItem={RosterListItem} title="Rosters">
        <Menubar.Root className="flex rounded-md p-2 m-2">
          <Menubar.Menu>
            <Menubar.Trigger
              className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700"
              onClick={() => setExpModal('newRoster')}
            >
              <PlusCircledIcon width="20" height="20" /> <span>Create New Roster</span>
            </Menubar.Trigger>
          </Menubar.Menu>
        </Menubar.Root>
      </ListContainer>
    </div>
  );
}

export default ViewRosters;
