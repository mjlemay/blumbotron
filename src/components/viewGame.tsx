import { useShallow } from 'zustand/react/shallow';
import { useExperienceStore } from '../stores/experienceStore';
import { useState } from 'react';
import UiButton from './uiButton';
import SubViewLaunch from './subViewLaunch';
import FormGameStyles from './formGameStyles';
import FromGameTableConfig from './formGameTableConfig';

function ViewGame() {
  const { selected } = useExperienceStore(
    useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView }))
  );
  const selectedGame = selected?.game || null;
  const {
    name = '',
    id = '',
  } = selectedGame || {};
  const [subView, setSubView] = useState<string>('launch');

  const handleSubViewSelect = (subView: string) => {
    setSubView(subView);
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
          onClick={() => handleSubViewSelect('launch')}
        >
          <UiButton uiIcon="launch" size="30" isSelected={subView === 'launch'} />
          <span className="text-sm">Launch</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('config')}
        >
          <UiButton uiIcon="config" size="30" isSelected={subView === 'config'} />
          <span className="text-sm">Config</span>
        </div>
        <div
          className="flex flex-col items-center justify-center p-2"
          onClick={() => handleSubViewSelect('layout')}
        >
          <UiButton uiIcon="layout" size="30" isSelected={subView === 'layout'} />
          <span className="text-sm">Layout</span>
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
        {subView === 'launch' && <SubViewLaunch gameData={selectedGame} />}
        {subView === 'config' && <FromGameTableConfig />}
        {subView === 'layout' && <FormGameStyles />}
      </div>
    </div>
  );
}

export default ViewGame;
