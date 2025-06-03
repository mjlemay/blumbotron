import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";

function ViewRoster() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const selectedRoster = selected?.roster || null;
    const { name = '', id = '' } = selectedRoster || {};

    return (
      <div key={`${id}-${name}`} >
          <h2>Roster: {name}</h2>
          <p>{JSON.stringify(selectedRoster) || 'No roster selected'}</p>
      </div>
    );
}

export default ViewRoster;