import { useEffect, useState, useMemo } from "react";
import { usePlayerStore } from "../stores/playersStore";
import { useGameStore } from "../stores/gamesStore";
import { useRosterStore } from "../stores/rostersStore";
import { useScoreStore } from "../stores/scoresStore";
import { useExperienceStore } from "../stores/experienceStore";
import { DisplayData, ScoreDataItem } from "../lib/types";
import { invoke } from '@tauri-apps/api/core';
import { customThemeSettings } from '../lib/consts';

type ComponentProps = {
  game?: string;
  fetchIntervalSeconds?: number;
  isFullScreen?: boolean;
  numberOfScores?: number;
  displayIndex?: number;
};

const paddingValue = 0;

function DisplayTable(props: ComponentProps): JSX.Element {
  const { 
    fetchIntervalSeconds = 60,
    game,
    isFullScreen = false,
    numberOfScores = 10,
    displayIndex
  } = props;
  const { players } = usePlayerStore();
  const { games } = useGameStore();
  const { rosters } = useRosterStore();
  const { experience } = useExperienceStore();
  const subSelected = experience?.subSelected || 0;
  const { gameScores, fetchUniqueScoresByGame } = useScoreStore();
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string>('');
  const [logoImageSrc, setLogoImageSrc] = useState<string>('');
  const [titleImageSrc, setTitleImageSrc] = useState<string>('');
  
  // Memoize game data lookup
  const gameData = useMemo(() => 
    games.find((gameItem) => gameItem.snowflake === game), 
    [games, game]
  );
  const displayData: DisplayData | null = useMemo(() => 
    {
      const expDisplayIndex: number = subSelected as number || displayIndex || 0;
      return gameData?.data?.displays ? gameData.data.displays[expDisplayIndex] : null;
    },
    [gameData, displayIndex, subSelected]
  );
  
  // Memoize roster data lookup
  const rosterData = useMemo(() => 
    rosters.find((roster) => roster.snowflake === gameData?.roster),
    [rosters, gameData?.roster]
  );

  const themeName = gameData?.data?.theme;
  const customTheme = (customThemeSettings?.themes && typeof customThemeSettings.themes[(themeName as unknown as string)] === 'object')
    ? customThemeSettings.themes[(themeName as unknown as string)]
    : {};
  const themeColors = (typeof customTheme === 'object' && 'colors' in customTheme)
    ? (customTheme as { colors?: Record<string, string> }).colors || {}
    : {};
  
  // Memoize allowed players processing
  const { playersData } = useMemo(() => {
    const allowed = rosterData && rosterData.allow && rosterData?.allow?.length >= 1 ?
      rosterData?.allow : [];
    const playersString = allowed.join(',');
    // If there are allowed players, use them, otherwise use all players
    const playerData = playersString.length > 0 ? allowed?.map((player) => 
      players.find((playerItem) => playerItem.snowflake === player)) : players;
    
    return { allowedPlayers: allowed, playersData: playerData };
  }, [rosterData, players]);

  // Get offset value before using it in tableData
  const offset = displayData?.offset || 0;
  const direction = displayData?.direction || 'descending';
  
  // Memoize table data processing
  const tableData = useMemo(() => {
    const sortedPlayers = gameScores[game || '']?.sort((a, b) => {
      return direction === 'ascending' 
        ? (a?.amount || 0) - (b?.amount || 0)  // ascending: low to high
        : (b?.amount || 0) - (a?.amount || 0); // descending: high to low
    }) || [];
    
    // Apply offset by slicing the sorted array (skip top N players)
    const offsetPlayers = sortedPlayers.slice(offset);
    
    return offsetPlayers?.map((scoreItem: ScoreDataItem) => {
      const playerData = playersData.find((playerItem) => playerItem?.snowflake === scoreItem?.player);
      if(typeof playerData?.name !== 'undefined') {
        return {
          player: playerData?.name,
          score: scoreItem?.amount,
        };
      }
    }).filter(item => item !== undefined);
  }, [gameScores, game, playersData, offset, direction]);

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
  const backgroundImage = displayData?.backgroundImage 
    || gameData?.data?.media?.backgroundImage 
    || null;
  const logoImage = gameData?.data?.media?.logoImage 
    || null;
  const titleImage = displayData?.titleImage || null;
  const logoImageOpacity = gameData?.data?.media?.logoImageOpacity || 100;
  const logoImageScale = gameData?.data?.media?.logoImageScale || 25;
  const logoImagePosition = gameData?.data?.media?.logoImagePosition || 'center';
  const logoImageHorizontalOffset = gameData?.data?.media?.logoImageHorizontalOffset || 0;
  const logoImageVerticalOffset = gameData?.data?.media?.logoImageVerticalOffset || 0;
  const calculatedLogoPosition = () => {
    const positions = logoImagePosition.split(' ');
    if (logoImagePosition === 'center') {
      return logoImagePosition; // return as is if not in expected format
    }
    if (positions.length === 1) {
      return `${positions[0]} ${logoImageHorizontalOffset}% top 50%`;
    }
    return `${positions[0]} ${logoImageVerticalOffset}% ${positions[1]} ${logoImageHorizontalOffset}%`;
  };
  const backgroundImageOpacity = gameData?.data?.media?.backgroundImageOpacity || 100;

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
    const loadLogoImage = async () => {
      if (logoImage) {
        try {
          // If it's already a data URL, use it directly
          if (logoImage.startsWith('data:')) {
            setLogoImageSrc(logoImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: logoImage }) as string;
          setLogoImageSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load logo image:', logoImage, error);
          setLogoImageSrc('');
        }
      } else {
        setLogoImageSrc('');
      }
    };
    
    const loadTitleImage = async () => {
      if (titleImage) {
        try {
          // If it's already a data URL, use it directly
          if (titleImage.startsWith('data:')) {
            setTitleImageSrc(titleImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: titleImage }) as string;
          setTitleImageSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load title image:', titleImage, error);
          setTitleImageSrc('');
        }
      } else {
        setTitleImageSrc('');
      }
    };
    
    loadLogoImage();
    loadBackgroundImage();
    loadTitleImage();
  }, [backgroundImage, logoImage, titleImage]);

  const placement = gameData?.data?.placement || {
    paddingFrame: {
      top: paddingValue,
      bottom: paddingValue,
      left: paddingValue,
      right: paddingValue,
    },
  };
  const title = displayData?.title || 'High Scores';
  const numberOfRows = displayData?.rows || numberOfScores;

  // Use tableData directly since it's already sorted based on direction
  const tableDataSorted = useMemo(() => {
    return tableData && tableData.length > 0 ? 
      tableData.filter(item => item !== undefined) : [];
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
          backgroundColor: index % 2 === 0 ? colors.tableAlt || themeColors.tableAlt || 'transparent' : colors.tableRow || themeColors.tableRow || 'transparent',
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
          color: colors.fontPlayer || themeColors.fontPlayer || colors.secondary || themeColors.secondary || colors.text || themeColors.text,
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
          color: colors.fontScore 
            || themeColors.fontScore
            || colors.secondary 
            || themeColors.secondary
            || colors.text
            || themeColors.text,
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
              backgroundColor: colors.tableRow || themeColors.tableRow || 'transparent',
            }}
          >
            <div
            style={{
              backgroundColor: i % 2 === 0 ? colors.tableAlt || themeColors.tableAlt || 'transparent' : colors.tableRow || themeColors.tableRow || 'transparent',
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
        backgroundColor: colors.background || themeColors.background,
        backgroundImage: backgroundImageSrc ? `url("${backgroundImageSrc}")` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: colors.text || themeColors.text,
        opacity: backgroundImageOpacity / 100,
        minWidth: isFullScreen ? '100vw' : '100%',
        minHeight: isFullScreen ? '100vh' : '100%',
      }}
    >
      <div className={`
      ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
       flex items-start justify-center
      `}
      style={{
        backgroundImage: logoImageSrc ? `url("${logoImageSrc}")` : 'none',
        backgroundPosition: logoImagePosition ? calculatedLogoPosition() : 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${logoImageScale}%`,
        color: colors.text || themeColors.text,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        opacity: logoImageOpacity / 100,
        maxWidth: isFullScreen ? `100vw` : `100%`,
        maxHeight: isFullScreen ? `100vh` : `100%`,
      }}
    ></div>
      
      {!gameData && (
        <div className="min-h-full z-10 opacity-100 min-w-full flex items-center justify-center">
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
            opacity-100
            z-10
            ${isFullScreen ? 'min-w-[100vw] min-h-[100vh]' : 'w-full h-full backdrop-blur-xl'}
          `}
          style={{
            paddingTop: `${isFullScreen ? placement?.paddingFrame?.top : 0}vh`,
            paddingBottom: `${isFullScreen ? placement?.paddingFrame?.bottom : 0}vh`,
            paddingLeft: `${isFullScreen ? placement?.paddingFrame?.left : 0}vw`,
            paddingRight: `${isFullScreen ? placement?.paddingFrame?.right : 0}vw`,
          }}
          >
          <div
            className="flex flex-row grow min-w-full min-h-full"
            data-augmented-ui={isFullScreen ? "tl-rect tr-2-clip-y br-2-clip-y bl-rect l-clip both" : ""}
          >
            <div className="flex flex-col grow min-w-full min-h-full items-center justify-center flex-1">
              <div className="flex flex-col justify-start min-w-full min-h-full">
                <div className="flex flex-row items-stretch justify-start w-full flex-1">
                  {titleImageSrc ? <img src={titleImageSrc} alt="Title" className="flex-1" /> : title && title.length > 0 && (
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
                      color: 
                        colors.fontHeader 
                        || themeColors.fontHeader
                        || colors.primary 
                        || themeColors.primary
                        || colors.text
                        || themeColors.text,
                      backgroundColor: 
                        colors.tableHeader 
                        || themeColors.tableHeader 
                        || 'transparent',
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
