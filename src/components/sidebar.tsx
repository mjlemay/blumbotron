import UiButton from './uiButton';
import { useExperienceStore } from '../stores/experienceStore';
import { useShallow } from 'zustand/react/shallow';

type SidebarProps = {
  view?: string;
};

function Sidebar({ view }: SidebarProps): JSX.Element {
  const { setExpView, setExpSelected } = useExperienceStore(
    useShallow((state) => ({
      setExpView: state.setExpView,
      setExpSelected: state.setExpSelected,
      setExpModal: state.setExpModal,
      selected: state.experience.selected,
    }))
  );

  const handleViewSelect = (view: string) => {
    setExpView(view);
    setExpSelected({});
  };

  return (
    <div className="flex flex-col bg-slate-900/70 border-r border-slate-700 border-width-1 min-w-[80px] h-full">
      <div
        className="flex flex-col items-center justify-center p-2"
        onClick={() => handleViewSelect('home')}
      >
        <UiButton uiIcon="game" isSelected={view === 'home'} />
        <span className="text-sm">Games</span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-2"
        onClick={() => handleViewSelect('players')}
      >
        <UiButton uiIcon="person" isSelected={view === 'players'} />
        <span className="text-sm">Players</span>
      </div>
      <div
        className="flex flex-col items-center justify-center p-2"
        onClick={() => handleViewSelect('rosters')}
      >
        <UiButton uiIcon="roster" isSelected={view === 'rosters'} />
        <span className="text-sm">Rosters</span>
      </div>
    </div>
  );
}

export default Sidebar;
