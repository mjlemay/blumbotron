import { useGameStore } from "../stores/gamesStore";

export const refreshData = async () => {
    const { fetchGames } = useGameStore();
    await fetchGames();
}