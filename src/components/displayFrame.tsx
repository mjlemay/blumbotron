import {
  EnterFullScreenIcon,
  OpenInNewWindowIcon,
  AllSidesIcon,
  HamburgerMenuIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons';
import * as Menubar from '@radix-ui/react-menubar';
import { useExperienceStore } from '../stores/experienceStore';
import { useGameStore } from '../stores/gamesStore';
import { Window } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import DisplayTable from './displayTable';
import DisplaySlide from './displaySlide';
import ShadowContainer from './shadowContainer';
import { customThemeSettings } from '../lib/consts';

type ComponentProps = {
  height?: number;
  game?: string;
  displayIndex?: number;
};

function DisplayFrame(props: ComponentProps): JSX.Element {
  const { game, height = 300, displayIndex = 0 } = props;
  const { setExpModal, setExpSubView, setExpSubSelected, setExpSelected, setExpView } = useExperienceStore();
  const { getGameBySnowflake, editGame } = useGameStore();

  // Get the display type from the game data
  const currentGameData = getGameBySnowflake(game || '');
  const type = currentGameData?.data?.displays?.[displayIndex]?.category || 'table';

  // Generate isolated styles for the shadow DOM
  const themeName = currentGameData?.data?.theme;
  const themeSettings = customThemeSettings?.[themeName as string];
  const themeColors = themeSettings?.colors;
  const colorOverrideEnabled = !!currentGameData?.data?.colorOverride;
  const gameColors = currentGameData?.data?.colors;

  // Build CSS variables for the shadow root
  const getColor = (key: string) => {
    if (colorOverrideEnabled && gameColors?.[key as keyof typeof gameColors]) {
      return gameColors[key as keyof typeof gameColors];
    }
    return themeColors?.[key as keyof typeof themeColors] || undefined;
  };

  const shadowStyles = `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .shadow-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${getColor('background') || '#000'};
      color: ${getColor('text') || '#fff'};
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    /* Base flexbox utilities */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .flex-1 { flex: 1 1 0%; }
    .flex-shrink-0 { flex-shrink: 0; }
    .items-center { align-items: center; }
    .items-stretch { align-items: stretch; }
    .self-stretch { align-self: stretch; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-start { justify-content: flex-start; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    /* Base sizing utilities */
    .w-full { width: 100%; }
    .h-full { height: 100%; }
    .min-h-full { min-height: 100%; }
    .min-w-0 { min-width: 0; }
    .max-w-none { max-width: none; }
    /* Base spacing utilities */
    .p-1 { padding: 0.25rem; }
    .p-2 { padding: 0.5rem; }
    .p-4 { padding: 1rem; }
    .pl-4 { padding-left: 1rem; }
    .pr-4 { padding-right: 1rem; }
    .pt-2 { padding-top: 0.5rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    /* Base text utilities */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .leading-normal { line-height: 1.5; }
    .text-white { color: white; }
    /* Base positioning */
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
    .z-10 { z-index: 10; }
    /* Overflow */
    .overflow-hidden { overflow: hidden; }
    .overflow-auto { overflow: auto; }
    .overflow-visible { overflow: visible; }
    /* Border/rounded */
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }
    /* Display table specific */
    [data-content-container] {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .title {
      text-align: center;
      font-weight: bold;
    }
  `;


  const handleAllSidesClick = () => {
    setExpSubSelected(displayIndex);
    setExpModal('displayTable');
  };

  const handleOpenInNewWindowClick = async () => {
    if (!game) {
      console.error('No game available for new window');
      return;
    }
    
    try {      
      await invoke('create_display_window', {
        game: game,
        displayIndex: displayIndex,
        width: 1024,
        height: 800
      });
    } catch (error) {
      console.error('Failed to open display window:', error);
    }
  };

  const handleFullScreenClick = async () => {
    handleAllSidesClick();
    try {
      const appWindow = await Window?.getCurrent();
      await appWindow.setFullscreen(true);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  const handleDisplayFrameConfigClick = () => {
    if (!game) {
      console.error('No game available for configuration');
      return;
    }
    
    const currentGameData = getGameBySnowflake(game);
    if (!currentGameData) {
      console.error('Game data not found');
      return;
    }

    // Set the current game as selected and navigate to the game view with form subview
    setExpSelected({ game: currentGameData });
    setExpSubSelected(displayIndex);
    setExpView('game');
    setExpSubView('displayConfig');
  };

  const handleDeleteDisplay = async () => {
    if (displayIndex === 0) {
      console.warn('Cannot delete the first display');
      return;
    }
    if (!game) {
      console.error('No game snowflake available');
      return;
    }

    const currentGameData = getGameBySnowflake(game);
    if (!currentGameData || !currentGameData.data?.displays) {
      console.error('No game data or displays found');
      return;
    }

    // Don't allow deleting if it's the last display
    if (currentGameData.data.displays.length <= 1) {
      console.warn('Cannot delete the last display');
      return;
    }

    // Create updated displays array without the item at displayIndex
    const updatedDisplays = currentGameData.data.displays.filter((_, index) => index !== displayIndex);

    // Create updated game data
    const updatedGameData = {
      ...currentGameData,
      data: {
        ...currentGameData.data,
        displays: updatedDisplays,
      },
    };

    try {
      await editGame(updatedGameData);
    } catch (error) {
      console.error('Failed to delete display:', error);
    }
  };

  return (
    <div
      data-display-frame
      style={{
        height: `${height}px`,
        width: `${height * 1.5}px`,
      }}
      className="
                bg-black
                rounded-md
                overflow-hidden
                relative
            "
    >
      <ShadowContainer
        styles={shadowStyles}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="shadow-content">
          {type == 'table' && <DisplayTable game={game} displayIndex={displayIndex} fetchIntervalSeconds={60} />}
          {type == 'slide' && <DisplaySlide game={game} displayIndex={displayIndex} />}
        </div>
      </ShadowContainer>
      <div
        className="
            absolute
            top-0
            right-0
            flex
            flex-row
            items-center
            justify-end
            gap-2
            z-25
            opacity-50
            hover:opacity-100
            transition-opacity
            duration-200
        "
      >
          <Menubar.Root className="flex rounded-md p-2">
            <Menubar.Menu>
              <Menubar.Trigger
                className="flex select-none items-center justify-between cursor-pointer rounded px-2 py-2 text-lg gap-1.5 font-medium bg-sky-700"
                onClick={() => {}}
              ><HamburgerMenuIcon width="20" height="20" /></Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content className="bg-slate-700/50  z-30 rounded-md p-1 mt-1 min-w-[150px] rounded-md shadow-lg">
                  <Menubar.Item
                    className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                    onClick={handleDisplayFrameConfigClick}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <Pencil1Icon width="20" height="20" /> Edit
                    </div>
                  </Menubar.Item>
                  <Menubar.Item
                    disabled={displayIndex === 0}
                    className={`
                      cursor-pointer
                      bg-slate-600/50
                      ${displayIndex !== 0 && 'hover:bg-red-600/20'}
                      rounded-md
                      p-1
                      m-1
                      ${displayIndex === 0 && 'opacity-50 cursor-not-allowed'}
                      `}
                    onClick={handleDeleteDisplay}
                  >
                    <div className="flex flex-row gap-2 items-center">
                      <TrashIcon width="20" height="20" /> Delete
                    </div>
                  </Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          </Menubar.Root>
      </div>
      <div
        className="
            absolute
            bottom-0
            right-0
            flex
            flex-row
            items-center
            justify-end
            gap-2
            p-2
            z-25
            opacity-50
            hover:opacity-100
            transition-opacity
            duration-200
        "
      >
        <button 
          onClick={handleFullScreenClick}
          className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <EnterFullScreenIcon width="20" height="20" />
        </button>
        <button
          onClick={handleOpenInNewWindowClick} 
          className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200">
          <OpenInNewWindowIcon width="20" height="20" />
        </button>
        <button 
          onClick={handleAllSidesClick}
          className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <AllSidesIcon width="20" height="20" />
        </button>
      </div>
    </div>
  );
}

export default DisplayFrame;
