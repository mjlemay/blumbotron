import { useExperienceStore } from '../stores/experienceStore';
import ViewHome from './viewHome';
import ViewPlayers from './viewPlayers';
import ViewGame from './viewGame';
import ViewPlayer from './viewPlayer';
import ViewRoster from './viewRoster';
import ViewRosters from './viewRosters';
import Header from './header';
import Sidebar from './sidebar';
import DialogModal from './dialogModal';
import ThemeInjector from './themeInjector';

function MainViewer() {
  const { experience, loading, error } = useExperienceStore();
  const { view, modal, selected } = experience;
  const gameSelected = selected && selected.game;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const showView = (view: string) => {
    let selectedView = <></>;
    switch (view) {
      case 'home':
        selectedView = <ViewHome />;
        break;
      case 'player':
        selectedView = <ViewPlayer />;
        break;
      case 'players':
        selectedView = <ViewPlayers />;
        break;
      case 'roster':
        selectedView = <ViewRoster />;
        break;
      case 'rosters':
        selectedView = <ViewRosters />;
        break;
      case 'game':
        selectedView = <ViewGame />;
        break;
      default:
        selectedView = <ViewHome />;
        break;
    }
    return selectedView;
  };
  return (
    <main className="flex flex-col min-h-screen bg-slate-800">
      <ThemeInjector game={gameSelected?.snowflake} />
      <Header />
      <div className="flex flex-row">
        <div className="flex-0 min-w-[80px]">
          <Sidebar view={view} />
        </div>
        <div className="flex-1 flex items-center h-[calc(100vh-80px)] w-[calc(100vw-80px)] justify-center">
          {showView(view)}
        </div>
      </div>
      <DialogModal selectedModal={modal} isOpen={modal !== 'none'} />
    </main>
  );
}

export default MainViewer;
