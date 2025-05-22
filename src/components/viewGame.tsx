import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from "../stores/gamesStore";
import { useExperienceStore } from "../stores/experienceStore";

function ViewGame() {
    const { games } = useGameStore(useShallow((state) => ({ games: state.games })))
    const { selected, setExpView } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const { game } = selected;
    const selectedGame = games.find((gameItem) => gameItem.gameId === game.id as unknown as number);
    const { name = '', id = '' } = selectedGame || {};

    return (
      <div key={`${id}-${name}`} onClick={() => setExpView("home")}>
          <h2>Game: {name}</h2>
      </div>
    );
}

export default ViewGame;