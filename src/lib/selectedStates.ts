import { useExperienceStore } from "../stores/experienceStore";
import { useGameStore } from "../stores/gamesStore";
import { usePlayerStore } from "../stores/playersStore";
import { useRosterStore }  from "../stores/rostersStore";
import { useShallow } from "zustand/react/shallow";
import { SelectedItem } from "../lib/types";

export const getSelected = (store:string) => {
    const singleStr = store.substring(0, store.length - 1);
    const selectedStore = {
        games: useGameStore(useShallow((state) => ( state.games ))),
        players: usePlayerStore(useShallow((state) => ( state.players ))),
        rosters: useRosterStore(useShallow((state) => ( state.rosters ))),
    }
    const dataStore = selectedStore[store as keyof typeof selectedStore];
    const selected = useExperienceStore(useShallow((state) => ( state.experience.selected )));
    const selection = selected ? selected[singleStr] : null;
    const selectedGame = dataStore.find((item) => item.id === selection?.id);
    return selectedGame || null;
}

export const findAnySelected = (selected: Record<string, SelectedItem> | null) => {
    return selected && Object.values(selected)[0];
}


export const findCollectionType = (item: SelectedItem | null): string => {
    let type = 'null';
    if (item !== null) {
        type = 'roster' in item ? 'game' : 'player';
        type = 'allow' in item ? 'roster' : type;
    }
    return type;
}

export const returnToParent = (
    item: SelectedItem | null,
    setExpView: (view: string) => void,
    setExpModal: (modal: string) => void,
    setExpSelected: (selected: any) => void
) => {
    const parents:Record<string,string> = {
        'game': 'home',
        'player': 'players',
        'roster': 'rosters',
        'null': 'home'
    }
    const type = item ? findCollectionType(item) : 'null';
    setExpView(parents[type]);
    setExpModal('none');
    setExpSelected({});
}