import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";
import { usePlayerStore } from '../stores/playersStore';
import { RosterDataItem } from '../lib/types';
import SelectChip from './selectChip';
import Chip from './chip';
import { DataItem } from '../lib/types';
import { useRosterStore } from '../stores/rostersStore';

function ViewRoster() {
    const { selected, setExpSelected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpSelected: state.setExpSelected })));
    const { editRoster, rosters } = useRosterStore(); //TODO: Add player to roster
    const { players, loading, error, fetchPlayers } = usePlayerStore();
    const selectedRoster: RosterDataItem | null = selected?.roster || null;
    const { name = '', id = '', allow = [], deny = [] , opt_in = [], opt_out = []} = selectedRoster as RosterDataItem || {};

    useEffect(() => {
      fetchPlayers();
    }, []);

    useEffect(() => {
      setExpSelected
    }, [rosters]);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const getPlayerbySnowflake = (snowflake: string) => {
      return players?.find((player: DataItem) => player.snowflake === snowflake);
    }

    const handleAddPlayer = async (playerSnowflake: string,
      type: 'allow' | 'deny' | 'opt_in' | 'opt_out') => {
      if (selectedRoster) {
        const roster = {
          ...selectedRoster,
          [type]: [...(selectedRoster[type] || []), playerSnowflake]
        } as RosterDataItem;
        try {
          const response = await editRoster(roster);
          // Update the selected roster in the experience store with the response
          console.log('roster update response', response);
          setExpSelected({ roster: response });
        } catch (error) {
          console.error('Failed to edit roster:', error);
        }
      }
    }

    return (
      <div key={`${id}-${name}`}>
          <div className="flex flex-col min-h-[calc(100vh-8rem)] min-w-[calc(100vw-8rem)] bg-slate-600 justify-start rounded-lg p-2 m-2 pt-4 shadow-lg">
              <div className={`min-w-[46vw] bg-slate-600 shrink`}>
              <h2 className="text-3xl font-thin pl-2 pb-2">Participants</h2>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {allow && allow.map((player: string) => (
                  <Chip key={player} text={getPlayerbySnowflake(player)?.name || player} />
                ))}
                {allow.length == 0 && <p className="text-slate-400 p-2 text-lg">No players selected.</p>}
                <SelectChip 
                  selectPlaceholder="Add Player" 
                  selections={players ? players.map((item: DataItem) => ({ label: item.name, value: item.snowflake, data: {snowflake: item.snowflake} })) : []} 
                  handleSelect={(value) => handleAddPlayer(value, 'allow')}
                  resetOnSelect={true}
                />
              </div>
              <h2 className="text-3xl font-thin pl-2 pb-2">Banned Players</h2>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {deny && deny.map((player: string) => (
                  <Chip key={player} text={getPlayerbySnowflake(player)?.name || player} />
                ))}
                {deny.length == 0 && <p className="text-slate-400 p-2 text-lg">No players selected.</p>}
                <SelectChip 
                  selectPlaceholder="Add Player" 
                  selections={players ? players.map((item: DataItem) => ({ label: item.name, value: item.snowflake, data: {snowflake: item.snowflake} })) : []} 
                  handleSelect={(value) => handleAddPlayer(value, 'deny')}
                />
              </div>
              {opt_in.length > 0 && <div>
                <h2 className="text-3xl font-thin pl-2 pb-2">Opt In</h2>
                <div className="flex flex-wrap gap-2 p-1 mb-4">
                  {opt_in.map((player: string) => (
                    <Chip key={player} text={getPlayerbySnowflake(player)?.name || player} />
                  ))}
                </div>
              </div>}
              {opt_out.length > 0 && 
                <div>
                  <h2 className="text-3xl font-thin pl-2 pb-2">Opt Out</h2>
                  <div className="flex flex-wrap gap-2 p-1 mb-4">
                    {opt_out.map((player: string) => (
                      <Chip key={player} text={getPlayerbySnowflake(player)?.name || player} />
                    ))}
                  </div>
                </div>
              }
              {!selectedRoster && <p className="text-slate-400">No roster selected</p>}
            </div>
          </div>
        </div>
    );
}

export default ViewRoster;