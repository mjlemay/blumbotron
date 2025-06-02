import { useExperienceStore } from "../stores/experienceStore";
import { useGameStore } from "../stores/gamesStore";
import { usePlayerStore } from "../stores/playersStore";
import { useShallow } from "zustand/react/shallow";

export const getSelected = (store:string) => {
    const singleStr = store.substring(0, store.length - 1);
    const selectedStore = {
        games: useGameStore(useShallow((state) => ( state.games ))),
        players: usePlayerStore(useShallow((state) => ( state.players )))
    }
    const dataStore = selectedStore[store as keyof typeof selectedStore];
    const selected = useExperienceStore(useShallow((state) => ( state.experience.selected )));
    const selection = selected ? selected[singleStr] : null;
    const selectedGame = dataStore.find((item) => item.id === selection?.id);
    return selectedGame || null;
}

export const returnToHome = () => {
    const { setExpView, setExpModal, setExpSelected } = useExperienceStore(useShallow((state) => ({ setExpView: state.setExpView, setExpModal: state.setExpModal, setExpSelected: state.setExpSelected })));
    setExpView("home");
    setExpModal("none");
    setExpSelected({});
}