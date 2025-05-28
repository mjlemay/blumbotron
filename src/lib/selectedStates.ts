import { useExperienceStore } from "../stores/experienceStore";
import { useGameStore } from "../stores/gamesStore";
import { useShallow } from "zustand/react/shallow";

export const getSelectedGame = () => {
    const { games } = useGameStore(useShallow((state) => ({ games: state.games })))
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const game = selected?.game || null;
    const selectedGame = games.find((gameItem) => gameItem.gameId === game?.id);
    return selectedGame || null;
}