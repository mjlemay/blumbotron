import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";
import { Separator } from '@radix-ui/react-separator';
import { PersonIcon } from '@radix-ui/react-icons';

function ViewPlayer() {
    const { selected } = useExperienceStore(useShallow((state) => ({ selected: state.experience.selected, setExpView: state.setExpView })));
    const selectedPlayer = selected?.player || null;
    const { name = '', id = '', snowflake, created_at, updated_at } = selectedPlayer || {};

    return (
      <div key={`${id}-${name}`} >
        <div
          className="
            flex 
            flex-col
            min-h-[calc(100vh-8rem)]
            min-w-[calc(100vw-8rem)]
            bg-slate-600
            justify-start
            rounded-lg
            p-2 m-2
            pt-4
            shadow-lg
        ">
          <div className="w-full rounded bg-slate-700 p-4 mb-4 shadow-lg">
          <h2 className="text-3xl font-thin pl-2 pb-2 flex flex-row items-center gap-2">
            <PersonIcon className="w-8 h-8" />
            {name}
            {snowflake && (<span className="text-2xl text-slate-400">#{snowflake}</span>)}
          </h2>
          <div className="w-full text-slate-400 flex flex row items-center gap-2 justify-start">
            {created_at && (<span><label className="text-slate-500">Created</label> {created_at}</span>)}
            {created_at && updated_at && (<Separator className="w-[1px] h-4 bg-slate-500" orientation="vertical" decorative />)}
            {updated_at && (<span><label className="text-slate-500">Updated</label> {updated_at}</span>)}
          </div>
          </div>
          <div className="w-full">
            <h3 className="text-2xl font-thin pl-2 pb-2">Included in Games</h3>
            <div className="flex flex-wrap gap-2 p-1 mb-4">
             <p className="text-slate-400 p-1 text-lg">No games found.</p>
            </div>
            <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Games</h3>
            <div className="flex flex-wrap gap-2 p-1 mb-4">
            <p className="text-slate-400 p-1 text-lg">No games found.</p>
            </div>
            <h3 className="text-2xl font-thin pl-2 pb-2">Included in Rosters</h3>
            <div className="flex flex-wrap gap-2 p-1 mb-4">
            <p className="text-slate-400 p-1 text-lg">No games found.</p>
            </div>
            <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Rosters</h3>
            <div className="flex flex-wrap gap-2 p-1 mb-4">
            <p className="text-slate-400 p-1 text-lg">No games found.</p>
            </div>  
          </div>
        </div>
      </div>
    );
}

export default ViewPlayer;