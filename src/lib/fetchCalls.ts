import { useGameStore } from "../stores/gamesStore";
import { usePlayerStore } from "../stores/playersStore";

export const refreshData = async () => {
    const { fetchGames } = useGameStore();
    const { fetchPlayers } = usePlayerStore();
    await fetchGames();
    await fetchPlayers();
}