import { useEffect, useState, useMemo } from "react";
import { usePlayerStore } from "../stores/playersStore";
import { useGameStore } from "../stores/gamesStore";
import { useRosterStore } from "../stores/rostersStore";
import { useScoreStore } from "../stores/scoresStore";
import { useExperienceStore } from "../stores/experienceStore";
import { DisplayData, ScoreDataItem, UnitItem } from "../lib/types";
import { invoke } from '@tauri-apps/api/core';
import { customThemeSettings } from '../lib/consts';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import { json } from "stream/consumers";
import { map } from "zod";

// Avatar component for score table
const AvatarImage = ( { playerName, isFullScreen }: { playerName: string, isFullScreen: boolean } ) => {
  const [avatarSrc, setAvatarSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { players } = usePlayerStore();
  
  useEffect(() => {
    const loadAvatar = async () => {
      setIsLoading(true);
      
      if (!playerName) {
        // Generate placeholder for empty name
        const avatar = createAvatar(shapes, {
          size: 80,
          seed: 'unknown',
        });
        setAvatarSrc(avatar.toDataUri());
        console.log('placeholder', avatar.toDataUri())
        setIsLoading(false);
        return;
      }
      
      const player = players.find(p => p.name === playerName);
      const avatarImage = (player?.data as any)?.avatarImage;
      
      if (avatarImage) {
        try {
          if (avatarImage.startsWith('data:')) {
            setAvatarSrc(avatarImage);
            setIsLoading(false);
            return;
          }
          
          const imageData = await invoke<string>('get_background_image_data', { fileName: avatarImage });
          if (imageData) {
            setAvatarSrc(imageData);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.log('Failed to load player image, using generated avatar:', error);
        }
      }
      
      // Always fallback to generated avatar (when no avatar image or loading failed)
      // Find player's snowflake for consistent avatar generation
      const playerSnowflake = player?.snowflake || playerName;
    
      try {
        const avatar = createAvatar(shapes, {
          size: 80,
          seed: playerSnowflake,
        });
        const avatarDataUri = avatar.toDataUri();
      
        setAvatarSrc(avatarDataUri);
      } catch (error) {
           // Set a simple colored div as ultimate fallback
        setAvatarSrc('');
      }
      
      setIsLoading(false);
    };
    
    loadAvatar();
  }, [playerName, players]);
  
  return (
    <div 
      aria-label={`${playerName} avatar`}
      className={`
        rounded flex-shrink-0 self-stretch 
        ${isFullScreen ? 'border border-[2vh] border-transparent' : ''}
         items-center justify-center overflow-hidden relative
      `}
      style={{
        height: '100%',
        aspectRatio: '1',
      }}
    >
      {isLoading && (
        <div className="text-white text-xs">...</div>
      )}
      {!isLoading && avatarSrc && (
        <img 
          src={avatarSrc} 
          alt={`${playerName} avatar`}
          className="absolute inset-0 w-full h-full object-cover rounded"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      )}
      {!isLoading && !avatarSrc && (
        <div className="text-white text-sm font-bold">
          {playerName ? playerName.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
};

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
  const { gameScores, fetchScoresByGame } = useScoreStore();
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
  const sortUnit = displayData?.sortUnit || gameData?.data?.mechanics?.units?.[0]?.id;
  
  // Memoize table data processing
  const tableData = useMemo(() => {
    const allScores = gameScores[game || ''];
    
    const filteredScores = allScores?.filter((scoreItem: ScoreDataItem) => {
      // Convert both to numbers for comparison since unit IDs are numbers
      return Number(scoreItem.unit_id) === Number(sortUnit);
    }) || [];


    filteredScores.sort((a, b) => {
      return direction === 'ascending' 
        ? (Number(a?.datum) || 0) - (Number(b?.datum) || 0)  // ascending: low to high
        : (Number(b?.datum) || 0) - (Number(a?.datum) || 0); // descending: high to low
    }) || [];

    // Filter to keep only unique players (first occurrence after sorting)
    const seenPlayers = new Set<string>();
    const sortedPlayers = filteredScores.filter((scoreItem: ScoreDataItem) => {
      if (seenPlayers.has(scoreItem.player)) {
        return false;
      }
      seenPlayers.add(scoreItem.player);
      return true;
    });
    
    // Apply offset by slicing the sorted array (skip top N players)
    const offsetPlayers = sortedPlayers.slice(offset);

    const setColumnDatum = (player: string, unit: UnitItem) => {
      let playerScores = allScores?.filter((scoreItem: ScoreDataItem) => {
        return scoreItem.player === player && Number(scoreItem.unit_id) === Number(unit.id);
      }) || [];
      
      // Sort by created_at descending to get most recent first
      playerScores.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Most recent first
      });
      
      return playerScores.length > 0 ? playerScores[0].datum : null;
    }
    const allUnits = gameData?.data?.mechanics?.units || [];
    const filteredUnitIds = displayData?.filteredUnits || [];
    
    const displayUnits = filteredUnitIds.length > 0
      ? allUnits.filter(unit => filteredUnitIds.includes(String(unit.id)))
      : allUnits;

    return offsetPlayers?.map((scoreItem: ScoreDataItem) => {
      const playerData = playersData.find((playerItem) => playerItem?.snowflake === scoreItem?.player);
      
      const avatar = Array.isArray(playerData?.data?.avatar) && playerData!.data!.avatar.length > 0
        ? playerData!.data!.avatar[0]
        : null;
      let additionalColumns: any[] = [];
      
      if (displayUnits.length > 0) {
        for (const unit of displayUnits) {
          const columnValue = setColumnDatum(scoreItem.player, unit);
          additionalColumns.push(columnValue);
        }
      }

      let row = {
        player: playerData?.name || '[Deleted Player]',
        column_1: scoreItem?.datum,
        avatar,
        additionalColumns
      }

      return row;
    }).filter(item => item !== undefined);
  }, [gameScores, game, playersData, offset, direction, sortUnit, displayData, gameData]);

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
    
    // Handle 'center' case
    if (logoImagePosition === 'center') {
      return `${50 + logoImageHorizontalOffset}% ${50 + logoImageVerticalOffset}%`;
    }
    
    // Parse position values and calculate with offsets
    let horizontal = 50; // default center
    let vertical = 50;   // default center
    
    // Map position keywords to percentage values
    const horizontalMap: { [key: string]: number } = {
      'left': 0,
      'center': 50,
      'right': 100
    };
    
    const verticalMap: { [key: string]: number } = {
      'top': 0,
      'center': 50,
      'bottom': 100
    };
    
    // Parse the position string (e.g., 'top left', 'bottom center', etc.)
    positions.forEach(pos => {
      if (horizontalMap.hasOwnProperty(pos)) {
        horizontal = horizontalMap[pos];
      } else if (verticalMap.hasOwnProperty(pos)) {
        vertical = verticalMap[pos];
      }
    });
    
    // Apply offsets
    const finalHorizontal = Math.max(0, Math.min(100, horizontal + logoImageHorizontalOffset));
    const finalVertical = Math.max(0, Math.min(100, vertical + logoImageVerticalOffset));
    
    return `${finalHorizontal}% ${finalVertical}%`;
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
    // Fetch ALL scores for the game (not just unique)
    fetchScoresByGame(game || '');
    const interval = setInterval(() => {
      fetchScoresByGame(game || '');
    }, fetchIntervalSeconds * 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [game, fetchScoresByGame, fetchIntervalSeconds]);

const subHeaders = () => {
    if (!displayData?.showSubHeaders) {
      return null;
    }
    return (
      <div className="flex flex-row items-stretch justify-start w-full flex-1">
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
                      &nbsp;
                      { displayData?.filteredUnits.map((unitId) => {
                        const unit = gameData?.data?.mechanics?.units?.find(u => String(u.id) === String(unitId));
                        return (<div key={unitId}>{unit?.name || unitId}</div>);
                      })}
                    </div>
                  </div>
    )
  }

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
        className="flex flex-row items-center justify-between w-full flex-1"
        style={{
          backgroundColor: index % 2 === 0 ? colors.tableAlt || themeColors.tableAlt || 'transparent' : colors.tableRow || themeColors.tableRow || 'transparent',
        }}
      >
        {displayData?.showAvatars && AvatarImage && (
          <AvatarImage 
            playerName={scoreItem?.player || ''} 
            isFullScreen={isFullScreen}
          />
        )}
        <div className={`
          flex-1
          text-white
          font-bold
          flex
          items-center
          justify-start
          gap-2
          py-2
          pl-4
          min-w-0
          ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
        `}
        style={{
          color: colors.fontPlayer || themeColors.fontPlayer || colors.secondary || themeColors.secondary || colors.text || themeColors.text,
          fontFamily: fonts.player,
        }}
        >
          <span className="truncate">
            {scoreItem?.player || ' [ REMOVED ]'}
          </span>
        </div>
        {scoreItem?.additionalColumns && scoreItem.additionalColumns.length > 0 ? (
          scoreItem.additionalColumns.map((columnValue: any, colIndex: number) => (
            <div 
              key={`${scoreItem?.player}-col-${colIndex}`}
              className={`
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
              {columnValue !== null && columnValue !== undefined ? columnValue : '-'}
            </div>
          ))
        ) : (
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
            No scores
          </div>
        )}
      </div>
    )));
    if (limitedTableData.length < numberOfRows) {
      for (let i = limitedTableData.length; i < numberOfRows; i++) {
        limitedTableRows.push(
          <div 
            key={`empty-${i}`} 
            className="flex flex-row items-center justify-between w-full flex-1"
            style={{
              backgroundColor: i % 2 === 0 ? colors.tableAlt || themeColors.tableAlt || 'transparent' : colors.tableRow || themeColors.tableRow || 'transparent',
            }}
          >
            <div className={`
          flex-1
          text-white
          font-bold
          flex
          items-center
          justify-start
          gap-2
          py-2
          pl-4
          min-w-0
          ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
        `}>&nbsp;</div>
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
        color: colors.text || themeColors.text,
        minWidth: isFullScreen ? '100vw' : '100%',
        minHeight: isFullScreen ? '100vh' : '100%',
        position: 'relative',
      }}
    >
      {/* Background image layer with its own opacity */}
      {backgroundImageSrc && (
        <div className={`
          ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
          absolute inset-0
        `}
        style={{
          backgroundImage: `url("${backgroundImageSrc}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: backgroundImageOpacity / 100,
          zIndex: 1,
        }}
        ></div>
      )}
      {/* Logo image layer with its own opacity */}
      {logoImageSrc && (
        <div className={`
          ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
          absolute inset-0
        `}
        style={{
          backgroundImage: `url("${logoImageSrc}")`,
          backgroundPosition: logoImagePosition ? calculatedLogoPosition() : 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${logoImageScale}%`,
          opacity: logoImageOpacity / 100,
          zIndex: 2,
          maxWidth: isFullScreen ? `100vw` : `100%`,
          maxHeight: isFullScreen ? `100vh` : `100%`,
        }}
        ></div>
      )}
      
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
            overflow-hidden
            relative
            z-10
            ${isFullScreen ? 'w-screen h-screen' : 'w-full h-full backdrop-blur-xl'}
          `}
          style={{
            paddingTop: `${isFullScreen ? placement?.paddingFrame?.top : 0}vh`,
            paddingBottom: `${isFullScreen ? placement?.paddingFrame?.bottom : 0}vh`,
            paddingLeft: `${isFullScreen ? placement?.paddingFrame?.left : 0}vw`,
            paddingRight: `${isFullScreen ? placement?.paddingFrame?.right : 0}vw`,
          }}
          >
          <div
            className="flex flex-row w-full h-full theme-padding"
          >
            <div className="flex flex-col w-full h-full items-center justify-center">
              <div className="flex flex-col justify-start w-full h-full primary-mixin overflow-hidden"
                data-augmented-ui={isFullScreen ? "tl-rect br-rect tr-clip bl-clip both" : ""}
              >
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
                {subHeaders()}
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
