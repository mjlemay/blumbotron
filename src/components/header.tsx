import UiButton from "./uiButton";
import { useShallow } from 'zustand/react/shallow'
import { getSelectedGame } from "../lib/selectedStates";
import { GameDataItem } from "../lib/types";
import { useExperienceStore } from "../stores/experienceStore";
import { Separator } from "@radix-ui/react-separator";
import * as Menubar from "@radix-ui/react-menubar";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

interface HeaderProps {
  children?: React.ReactNode;
}

function Header(props: HeaderProps): JSX.Element {
    const { children } = props;
    const { setExpView, setExpSelected } = useExperienceStore(
      useShallow((state) => ({ setExpView: state.setExpView, setExpSelected: state.setExpSelected })));
    const game:GameDataItem | null = getSelectedGame() || null;
    const name = game?.name;

    const handleBack = () => {
        setExpView("home");
        setExpSelected({});
    }

    return (
    <div className="min-h-[80px] min-w-full items-center flex flex-row bg-slate-900 gap-4 px-4">
        <div className=" flex-grow text-2xl font-bold">{name || "BLUMBOTRON • High Scores Made Easy!" }</div>
        {children}
            {game && (
              <div className="flex-initial flex flex-row gap-4 items-center">
                  <Menubar.Root className="flex rounded-md p-2">
                    <Menubar.Menu>
                        <Menubar.Trigger 
                        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
                        onClick={() => {}}
                        >
                            <HamburgerMenuIcon 
                              width="20"
                              height="20"
                            /> <span>Options</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
                <Separator className="w-[1px] h-10 bg-slate-500" orientation="vertical" decorative />
                <UiButton uiIcon="back" clickHandler={() => handleBack()} />
              </div>
            )}
      </div>
    );
  }
  
  export default Header;