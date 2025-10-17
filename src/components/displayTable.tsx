import { useEffect, useState, useMemo } from "react";
import { usePlayerStore } from "../stores/playersStore";
import { useGameStore } from "../stores/gamesStore";
import { useRosterStore } from "../stores/rostersStore";
import { useScoreStore } from "../stores/scoresStore";
import { ScoreDataItem } from "../lib/types";
import { invoke } from '@tauri-apps/api/core';

type ComponentProps = {
  game?: string;
  fetchIntervalSeconds?: number;
  isFullScreen?: boolean;
  numberOfScores?: number;
};

const paddingValue = 0;

interface GameData {
  colors?: {
    background?: string;
    text?: string;
  };
  fonts?: {
    header?: string;
    player?: string;
    score?: string;
  };
  displays?: Array<{
    title?: string;
    rows?: number;
    bgImage?: string;
  }>;
}

function DisplayTable(props: ComponentProps): JSX.Element {
  const { fetchIntervalSeconds = 60, game, isFullScreen = false, numberOfScores = 10 } = props;
  const { players } = usePlayerStore();
  const { games } = useGameStore();
  const { rosters } = useRosterStore();
  const { gameScores, fetchUniqueScoresByGame } = useScoreStore();
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string>('');
  
  // Memoize game data lookup
  const gameData = useMemo(() => 
    games.find((gameItem) => gameItem.snowflake === game), 
    [games, game]
  );
  
  // Memoize roster data lookup
  const rosterData = useMemo(() => 
    rosters.find((roster) => roster.snowflake === gameData?.roster),
    [rosters, gameData?.roster]
  );
  
  // Memoize allowed players processing
  const { allowedPlayers, playersData } = useMemo(() => {
    const allowed = rosterData && rosterData.allow && rosterData?.allow?.length >= 1 ?
      rosterData?.allow : [];
    const playersString = allowed.join(',');
    // If there are allowed players, use them, otherwise use all players
    const playerData = playersString.length > 0 ? allowed?.map((player) => 
      players.find((playerItem) => playerItem.snowflake === player)) : players;
    
    return { allowedPlayers: allowed, playersData: playerData };
  }, [rosterData, players]);
  // Memoize table data processing
  const tableData = useMemo(() => {
    return gameScores[game || '']?.map((scoreItem: ScoreDataItem) => {
      const playerData = playersData.find((playerItem) => playerItem?.snowflake === scoreItem?.player);
      if(typeof playerData?.name !== 'undefined') {
        return {
          player: playerData?.name,
          score: scoreItem?.amount,
        };
      }
    });
  }, [gameScores, game, playersData]);
  const colors = {
    background: 'black',
    text: 'white',
    primary: null,
    secondary: null,
    tertiary: null,
    tableHeader: null,
    tableRow: null,
    tableAlt: null,
    fontPlayer: null,
    fontHeader: null,
    fontScore: null,
    ...(gameData?.data?.colors || {})
  };
  
  const fonts = {
    header: 'Arial, sans-serif',
    player: 'Arial, sans-serif',
    score: 'Arial, sans-serif',
    ...(gameData?.data?.fonts || {})
  };
  const backgroundImage = gameData?.data?.displays?.[0]?.bgImage || null;

  // Load background image when it changes
  useEffect(() => {
    const loadBackgroundImage = async () => {
      if (backgroundImage) {
        try {
          // If it's already a data URL, use it directly
          if (backgroundImage.startsWith('data:')) {
            setBackgroundImageSrc(backgroundImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: backgroundImage }) as string;
          setBackgroundImageSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load background image:', backgroundImage, error);
          setBackgroundImageSrc('');
        }
      } else {
        setBackgroundImageSrc('');
      }
    };
    
    loadBackgroundImage();
  }, [backgroundImage]);

  const placement = gameData?.data?.placement || {
    paddingFrame: {
      top: paddingValue,
      bottom: paddingValue,
      left: paddingValue,
      right: paddingValue,
    },
  };
  const title = gameData?.data?.displays?.[0]?.title || 'High Scores';
  const numberOfRows = gameData?.data?.displays?.[0]?.rows || numberOfScores;

  // Memoize table data sorting
  const tableDataSorted = useMemo(() => {
    return tableData && tableData.length > 0 ? 
      [...tableData].sort((a, b) => (b?.score || 0) - (a?.score || 0)) : [];
  }, [tableData]);


  useEffect(() => {
    // Initial fetch of scores
    fetchUniqueScoresByGame(game || '');
    const interval = setInterval(() => {
      fetchUniqueScoresByGame(game || '');
    }, fetchIntervalSeconds * 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [game, fetchUniqueScoresByGame, fetchIntervalSeconds]);

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
          color: colors.fontPlayer || colors.secondary || colors.text,
          fontFamily: fonts.player,
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
          color: colors.fontScore || colors.secondary || colors.text,
          fontFamily: fonts.score,
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
      ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
       flex items-start justify-center
      `}
      style={{
        backgroundColor: colors.background,
        backgroundImage: backgroundImageSrc ? `url("${backgroundImageSrc}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: colors.text,
        minWidth: isFullScreen ? '100vw' : '100%',
        minHeight: isFullScreen ? '100vh' : '100%',
      }}
    >

      
      {!gameData && (
        <div className="min-h-full min-w-full flex items-center justify-center">
          Table not found
        </div>
      )}
      {gameData && gameScores[game || ''] && (
        <>
        <div data-table-container 
          className={`
            flex flex-col
            items-center
            justify-start
            ${isFullScreen ? 'min-w-[100vw] min-h-[100vh]' : 'w-full h-full backdrop-blur-xl'}
          `}
          style={{
            paddingTop: `${isFullScreen ? placement?.paddingFrame?.top : 0}vh`,
            paddingBottom: `${isFullScreen ? placement?.paddingFrame?.bottom : 0}vh`,
            paddingLeft: `${isFullScreen ? placement?.paddingFrame?.left : 0}vw`,
            paddingRight: `${isFullScreen ? placement?.paddingFrame?.right : 0}vw`,
          }}
          >
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
                      color: colors.fontHeader || colors.primary || colors.text,
                      backgroundColor: colors.tableHeader || 'transparent',
                      fontFamily: fonts.header,
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
        </>
      )}
    </div>
  );
}

export default DisplayTable;
