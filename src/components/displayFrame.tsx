import { 
  EnterFullScreenIcon,
  OpenInNewWindowIcon,
  AllSidesIcon
} from '@radix-ui/react-icons';
import DisplayTable from './displayTable';
import { useExperienceStore } from '../stores/experienceStore';
import { Window } from '@tauri-apps/api/window';

type ComponentProps = {
  height?: number;
  game?: string;
};

function DisplayFrame(props: ComponentProps): JSX.Element {
  const { game, height = 300 } = props;
  const { setExpModal } = useExperienceStore();

  const handleAllSidesClick = () => {
    setExpModal('displayTable');
  };

  const handleFullScreenClick = async () => {
    setExpModal('displayTable');
    try {
      const appWindow = await Window.getCurrent();
      await appWindow.setFullscreen(true);
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    }
  };

  return (
    <div
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
        <DisplayTable game={game} fetchIntervalSeconds={60} />
      </div>
      <div
        className={`
            absolute
            bottom-0
            right-0
            flex
            flex-row
            items-center
            justify-end
            gap-2
            p-2
            opacity-50
            hover:opacity-100
            transition-opacity
            duration-200
        `}
      >
        <button 
          onClick={handleFullScreenClick}
          className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <EnterFullScreenIcon width="20" height="20" />
        </button>
        <button className="flex select-none items-center justify-center cursor-pointer rounded shadow-sm p-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600/80 active:bg-sky-600/90 disabled:bg-sky-600/50 disabled:cursor-not-allowed transition-colors duration-200">
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
