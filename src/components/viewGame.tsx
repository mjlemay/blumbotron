import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";

function ViewGame() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const selectedGame = selected?.game || null;
    const { name = '', id = '' } = selectedGame || {};

    return (
      <div key={`${id}-${name}`} >
          <h2>Game: {name}</h2>
          <p>{JSON.stringify(selectedGame) || 'No game selected'}</p>
      </div>
    );
}

export default ViewGame;