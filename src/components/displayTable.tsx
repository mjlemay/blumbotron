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
  numberOfScores?: number;
};

function DisplayTable(props: ComponentProps): JSX.Element {
  const { fetchIntervalSeconds = 60, game, isFullScreen = false, numberOfScores = 10 } = props;
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
    if(typeof playerData?.name !== 'undefined') {
      return {
        player: playerData?.name,
        score: scoreItem?.amount,
      };
    }
  });
  const colors = gameData?.data?.colors || {
    background: 'black',
    text: 'white',
    primary: null,
    secondary: null,
    tertiary: null,
    tableHeader: null,
    tableRow: null,
    tableAlt: null,
  };
  const title = gameData?.data?.displays?.[0]?.title || 'High Scores';
  const numberOfRows = gameData?.data?.displays?.[0]?.rows || numberOfScores;

  const tableDataSorted = tableData && tableData.length > 0 ? tableData.sort((a, b) => (b?.score || 0) - (a?.score || 0)) : [];


  useEffect(() => {
    fetchUniqueScoresByGame(game || '');
    setInterval(() => {
      fetchUniqueScoresByGame(game || '');
    }, fetchIntervalSeconds * 1000);
  }, []);

  const tableDataSortedLimited = () => {
    let limitedTableData = [];
    let limitedTableRows = null;
    if (tableDataSorted && tableDataSorted.length > numberOfRows) {
      limitedTableData = tableDataSorted.slice(0, numberOfRows);
    } else {
      limitedTableData = tableDataSorted;
    }
    limitedTableRows = limitedTableData.map((scoreItem, index) => (
      scoreItem?.player && (
      <div 
        key={`${scoreItem?.player || 'deleted'}-${index}`} 
        className="flex flex-row items-stretch justify-between w-full flex-1"
        style={{
          backgroundColor: index % 2 === 0 ? colors.tableAlt || 'transparent' : colors.tableRow || 'transparent',
        }}
      >
        <div className={`
          flex-1
          text-white
          font-bold
          text-center
          flex
          items-center
          justify-center
          ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
        `}
        style={{
          color: colors.secondary || colors.text,
        }}
        >
          {scoreItem?.player || ' [ REMOVED ]'}
        </div>
        <div className={`
          flex-1
          text-white
          font-bold
          text-center
          flex
          items-center
          justify-center
          ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
        `}
        style={{
          color: colors.text || colors.secondary || colors.text,
        }}
        >
          {scoreItem?.score}
        </div>
      </div>
    )));
    if (limitedTableData.length < numberOfRows) {
      for (let i = limitedTableData.length; i < numberOfRows; i++) {
        limitedTableRows.push(
          <div 
            key={`empty-${i}`} 
            className="flex flex-row items-stretch justify-between w-full flex-1"
            style={{
              backgroundColor: colors.tableRow || 'transparent',
            }}
          >
            <div
            style={{
              backgroundColor: i % 2 === 0 ? colors.tableAlt || 'transparent' : colors.tableRow || 'transparent',
            }}
            className="flex-1 text-white text-center flex items-center justify-center"/>
          </div>
        );
      }
    }
    return limitedTableRows;
  }

  return (
    <div className={`
      ${isFullScreen ? 'min-w-[100vw] min-h-[100vh]' : 'rounded-md w-full h-full'}
       flex items-start justify-center
      `}
      style={{
        backgroundColor: colors.background,
        color: colors.text,
      }}
    >
      {!gameData && (
        <div className="min-h-full min-w-full flex items-center justify-center">
          Table not found
        </div>
      )}
      {gameData && gameScores[game || ''] && (
        <div data-table-container 
          className={`
            flex flex-col
            items-center
            justify-start
            ${isFullScreen ? 'min-w-[100vw] min-h-[100vh]' : 'w-full h-full'}
          `}>
          <div className="flex flex-row grow min-w-full min-h-full">
            <div className="flex flex-col grow min-w-full min-h-full items-center justify-center flex-1">
              <div className="flex flex-col justify-start min-w-full min-h-full">
                <div className="flex flex-row items-stretch justify-start w-full flex-1">
                  {title && title.length > 0 && (
                    <div className={`
                      flex-1
                      text-white
                      font-bold
                      text-center
                      flex
                      items-center
                      justify-center
                      ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
                    `}
                    style={{
                      color: colors.primary || colors.text,
                      backgroundColor: colors.tableHeader || 'transparent',
                    }}
                    >
                      {title}
                    </div>
                  )}
                </div>
                {tableDataSortedLimited()}
                {!tableDataSorted && (
                  <div className="flex flex-row items-stretch justify-start w-full flex-1">
                    <div className="flex-1 text-white rounded-md p-1 text-center flex items-center justify-center">
                      No scores found
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayTable;
