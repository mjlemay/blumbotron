import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";

function ViewPlayer() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const selectedPlayer = selected?.player || null;
    const { name = '', id = '' } = selectedPlayer || {};

    return (
      <div key={`${id}-${name}`} >
          <h2>Player: {name}</h2>
          <p>{JSON.stringify(selectedPlayer) || 'No player selected'}</p>
      </div>
    );
}

export default ViewPlayer;