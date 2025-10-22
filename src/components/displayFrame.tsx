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
import { Window } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import ThemeInjector from './themeInjector';
import DisplayTable from './displayTable';

type ComponentProps = {
  height?: number;
  game?: string;
};

function DisplayFrame(props: ComponentProps): JSX.Element {
  const { game, height = 300 } = props;
  const { setExpModal, setExpSubView, setExpSubSelected } = useExperienceStore();

  const handleAllSidesClick = () => {
    setExpModal('displayTable');
  };

  const handleOpenInNewWindowClick = async () => {
    try {      
      await invoke('create_display_window', {
        game: game,
        width: 1024,
        height: 800
      });
    } catch (error) {
      console.error('Failed to open display window:', error);
    }
  };

  const handleFullScreenClick = async () => {
    setExpModal('displayTable');
    try {
      const appWindow = await Window?.getCurrent();
      await appWindow.setFullscreen(true);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  const handleDisplayFrameConfigClick = () => {
    setExpSubSelected(0);
    setExpSubView('tableConfig');
  }

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
      <div className={`
        display-table-${game}
        absolute
        inset-0
        flex
        items-center
        justify-center
      `}>
        <ThemeInjector game={game} />
        <DisplayTable game={game} fetchIntervalSeconds={60} />
      </div>
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
                    disabled
                    className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                     onClick={() => {}}
                  >
                    <div data-disabled className="flex flex-row gap-2 items-center data-disabled:opacity-30">
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
