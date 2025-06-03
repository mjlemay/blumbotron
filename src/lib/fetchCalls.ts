export const refreshData = async (
    fetchGames: () => Promise<void>,
    fetchPlayers: () => Promise<void>,
    fetchRosters: () => Promise<void>
) => {
    await fetchGames();
    await fetchPlayers();
    await fetchRosters();
}