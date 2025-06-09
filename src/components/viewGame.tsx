import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";
import { useState } from 'react';
import UiButton from './uiButton';
import { Separator } from "@radix-ui/react-separator";
import SubViewLaunch from './subViewLaunch';

function ViewGame() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const selectedGame = selected?.game || null;
    const { name = '', id = '', snowflake = '', created_at = '', updated_at = '' } = selectedGame || {};
    const [subView, setSubView] = useState<string>('launch');

    const handleSubViewSelect = (subView: string) => {
        setSubView(subView);
    }

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
      ">
        <div className="
          flex
          flex-col
          min-h-full
          flex-0
          items-center
          p-2
          min-w-[80px]
        ">
          <div className="flex flex-col items-center justify-center p-2"
            onClick={() => handleSubViewSelect("launch")}
          >
            <UiButton uiIcon="launch" size="30" isSelected={subView === "launch"} />
            <span className="text-sm">Launch</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2"
            onClick={() => handleSubViewSelect("config")}
          >
            <UiButton uiIcon="config" size="30" isSelected={subView === "config"} />
            <span className="text-sm">Config</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2"
            onClick={() => handleSubViewSelect("layout")}
          >
            <UiButton uiIcon="layout" size="30" isSelected={subView === "layout"} />
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
      ">
        {subView === 'launch' && (
            <SubViewLaunch gameData={selectedGame} />
        )}
        {subView === 'config' && (
           <div className="w-full rounded bg-slate-700 p-4 mb-4 shadow-lg">
           <h2 className="text-3xl font-thin pb-2 flex flex-row items-center gap-2">
             {name}
             {snowflake && (<span className="text-2xl text-slate-400">#{snowflake}</span>)}
           </h2>
           <div className="w-full text-slate-400 flex flex row items-center gap-2 justify-start">
             {created_at && (<span><label className="text-slate-500">Created</label> {created_at}</span>)}
             {created_at && updated_at && (<Separator className="w-[1px] h-4 bg-slate-500" orientation="vertical" decorative />)}
             {updated_at && (<span><label className="text-slate-500">Updated</label> {updated_at}</span>)}
           </div>
          </div>
        )}
        {subView === 'layout' && (
          <>
            <h2 className="text-3xl font-thin pb-2 flex flex-row items-center gap-2">
              {name} Layout & Styles
            </h2>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewGame;