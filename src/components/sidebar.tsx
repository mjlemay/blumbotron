import UiButton from "./uiButton";


function Sidebar(): JSX.Element {

    return (
      <div className="flex flex-col bg-slate-900/70 border-r border-slate-700 border-width-1 min-w-[80px] h-full">
        <div className="flex flex-col items-center justify-center p-2">
            <UiButton uiIcon="game" />
            <span className="text-sm">Games</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2">
            <UiButton uiIcon="person" />
            <span className="text-sm">Players</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2">
            <UiButton uiIcon="roster" />
            <span className="text-sm">Rosters</span>
        </div>
      </div>
    );
  }
  
  export default Sidebar;