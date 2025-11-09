import { useShallow } from 'zustand/react/shallow';
import { useExperienceStore } from '../stores/experienceStore';
import UiButton from './uiButton';
import SubViewLaunch from './subViewLaunch';
import FormGameStyles from './formGameStyles';
import FormGameDisplayConfig from './formGameDisplayConfig';
import FormGameMedia from './formGameMedia';
import FormGameLayout from './formGameLayout';
import FormGameMechanics from './formGameMechanics';

function ViewGame() {
  const { selected, subView, setExpSubView } = useExperienceStore(
    useShallow((state) => ({
      selected: state.experience.selected,
      subView: state.experience.subView,
      setExpSubView: state.setExpSubView,
    }))
  );
  const selectedGame = selected?.game || null;
  const {
    name = '',
    id = '',
  } = selectedGame || {};

  const handleSubViewSelect = (subView: string) => {
    setExpSubView(subView);
  };

  return (
    <div
      key={`${id}-${name}`}
      className="
          flex
          flex-row
          justify-start
          gap-0
          m-2
          overflow-hidden
          flex-nowrap
          shadow-lg
          rounded-lg
          min-h-[calc(100vh-8rem)]
          min-w-[calc(100vw-8rem)]
          bg-slate-700/50
      "
    >
      <div
        className="
          flex
          flex-col
          min-h-full
          flex-0
          items-center
          p-2
          min-w-[80px]
        "
      >
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('main')}
        >
          <UiButton uiIcon="launch" size="30" isSelected={subView === 'main'} />
          <span className="text-sm">Launch</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('styles')}
        >
          <UiButton uiIcon="styles" size="30" isSelected={subView === 'styles'} />
          <span className="text-sm">Styles</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('media')}
        >
          <UiButton uiIcon="image" size="30" isSelected={subView === 'media'} />
          <span className="text-sm">Media</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('layout')}
        >
          <UiButton uiIcon="layout" size="30" isSelected={subView === 'layout'} />
          <span className="text-sm">Layout</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('mechanics')}
        >
          <UiButton uiIcon="mechanics" size="30" isSelected={subView === 'mechanics'} />
          <span className="text-sm">Mechanics</span>
        </div>
      </div>
      <div
        className="
          flex
          flex-1
          flex-col
          min-h-[calc(100vh-6rem)]
          min-w-[calc(100vw-14rem)]
          bg-slate-600
          justify-start
          p-4
          shadow-l
      "
      >
        {subView === 'main' && <SubViewLaunch gameData={selectedGame} />}
        {subView === 'media' && <FormGameMedia />}
        {subView === 'styles' && <FormGameStyles />}
        {subView === 'layout' && <FormGameLayout />}
        {subView === 'mechanics' && <FormGameMechanics />}
        {subView === 'displayConfig' && <FormGameDisplayConfig />}
      </div>
    </div>
  );
}

export default ViewGame;
