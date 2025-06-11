import { useEffect } from "react";
import { usePlayerStore } from "../stores/playersStore";
import { useGameStore } from "../stores/gamesStore";
import { useRosterStore } from "../stores/rostersStore";
import { useScoreStore } from "../stores/scoresStore";
import { ScoreDataItem } from "../lib/types";

type ComponentProps = {
  game?: string;
  fetchIntervalSeconds?: number;
  isFullScreen?: boolean;
};

function DisplayTable(props: ComponentProps): JSX.Element {
  const { fetchIntervalSeconds = 60, game, isFullScreen = false } = props;
  const { players } = usePlayerStore();
  const { games } = useGameStore();
  const { rosters } = useRosterStore();
  const { gameScores, fetchUniqueScoresByGame } = useScoreStore();


  const gameData = games.find((gameItem) => gameItem.snowflake === game);
  const rosterData = rosters.find((roster) => roster.snowflake === gameData?.roster);
  const allowedPlayers = rosterData && rosterData.allow && rosterData?.allow?.length >= 1 ?
    rosterData?.allow : [];
  const playersString = allowedPlayers.join(',');
  // If there are allowed players, use them, otherwise use all players
  const playersData = playersString.length > 0 ? allowedPlayers?.map((player) => 
    players.find((playerItem) => playerItem.snowflake === player)) : players;
  const tableData = gameScores[game || '']?.map((scoreItem: ScoreDataItem) => {
    const playerData = playersData.find((playerItem) => playerItem?.snowflake === scoreItem?.player);
    return {
      player: playerData?.name,
      score: scoreItem?.amount,
    };
  });

  const tableDataSorted = tableData && tableData.length > 0 ? tableData.sort((a, b) => (b?.score || 0) - (a?.score || 0)) : [];


  useEffect(() => {
    fetchUniqueScoresByGame(game || '');
    setInterval(() => {
      fetchUniqueScoresByGame(game || '');
    }, fetchIntervalSeconds * 1000);
  }, []);



  return (
    <div className={`
      ${isFullScreen ? 'top-0 left-0 min-w-[100vw] min-h-[100vh] overflow-hidden' : 'rounded-md w-full h-full'}
      bg-black flex items-center justify-center
      `}>
      {!gameData && (
        <div className="min-h-full min-w-full flex items-center justify-center">
          Table not found
        </div>
      )}
      {gameData && gameScores[game || ''] && (
        <div className="flex flex-col items-center justify-start w-full h-full transform scale-90">
          <div className="flex flex-row items-center justify-start w-full">
            <div className="flex flex-col items-center justify-start w-full">
              <h2 className="text-white text-2xl font-bold">High Scores</h2>
              {tableData &&tableDataSorted.map((scoreItem) => (
                <div key={scoreItem.player} className="flex flex-row items-center justify-between w-full gap-2">
                  <div className="flex-1 text-white bg-gray-700 rounded-md p-1 text-center">
                    {scoreItem.player}
                  </div>
                  <div className="flex-1 text-white bg-gray-500 rounded-md p-1 text-center">
                    {scoreItem.score}
                  </div>
                </div>
              ))}
              {!tableDataSorted && (
                <div className="flex flex-row items-center justify-start w-full gap-2">
                  <div className="flex-1 text-white bg-gray-700 rounded-md p-1 text-center">
                    No scores found
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayTable;
