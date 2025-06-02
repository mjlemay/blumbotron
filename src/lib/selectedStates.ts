import { useExperienceStore } from "../stores/experienceStore";
import { useGameStore } from "../stores/gamesStore";
import { usePlayerStore } from "../stores/playersStore";
import { useShallow } from "zustand/react/shallow";


//TODO: Refactor this to "getSelected" for all stores
export const getSelectedGame = () => {
    const { games } = useGameStore(useShallow((state) => ({ games: state.games })))
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const game = selected?.game || null;
    const selectedGame = games.find((item) => item.id === game?.id);
    return selectedGame || null;
}

export const getSelectedPlayer = () => {
    const { players } = usePlayerStore(useShallow((state) => ({ players: state.players })))
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const game = selected?.player || null;
    const selectedGame = players.find((item) => item.playerId === game?.id);
    return selectedGame || null;
}

export const returnToHome = () => {
    const { setExpView, setExpModal, setExpSelected } = useExperienceStore(useShallow((state) => ({ setExpView: state.setExpView, setExpModal: state.setExpModal, setExpSelected: state.setExpSelected })));
    setExpView("home");
    setExpModal("none");
    setExpSelected({});
}