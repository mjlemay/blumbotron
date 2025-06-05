import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";
import { usePlayerStore } from '../stores/playersStore';
import { RosterDataItem } from '../lib/types';
import SelectChip from './selectChip';
import { DataItem } from '../lib/types';

function ViewRoster() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    // const { addPlayerToRoster } = useExperienceStore(); //TODO: Add player to roster
    const { players, loading, error, fetchPlayers } = usePlayerStore();
    const selectedRoster = selected?.roster || null;
    const { name = '', id = '', allow = [], deny = [] , opt_in = [], opt_out = []} = selectedRoster as RosterDataItem || {};

    useEffect(() => {
      fetchPlayers();
    }, []);
  
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error: {error}</div>;

    return (
      <div key={`${id}-${name}`}>
        <div className="m-2">
          <div className="flex flex-col items-center bg-slate-600 s rounded-lg p-2 m-2 shadow-lg">
              <div className={`min-w-[46vw] bg-slate-600 shrink`}>
              <h2 className="text-3xl font-thin pl-2 pb-2">Participants</h2>
              <div>
                {JSON.stringify(allow)}
                <SelectChip 
                  selectPlaceholder="Add Player" 
                  selections={players ? players.map((item: DataItem) => ({ label: item.name, value: item.id, data: {snowflake: item.snowflake} })) : []} 
                  handleSelect={(value) => {
                    console.log(value);
                  }}
                />
              </div>
              <h2 className="text-3xl font-thin pl-2 pb-2">Banned Players</h2>
              <div>
                {JSON.stringify(deny)}
              </div>
              <div>
                {JSON.stringify(opt_in)}
                {JSON.stringify(opt_out)}
              </div>
              <p className="text-slate-400">{JSON.stringify(selectedRoster) || 'No roster selected'}</p>
            </div>
          </div>
        </div>
      </div>
    );
}

export default ViewRoster;