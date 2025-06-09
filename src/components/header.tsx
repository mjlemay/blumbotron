import UiButton from "./uiButton";
import { useShallow } from 'zustand/react/shallow'
import { useExperienceStore } from "../stores/experienceStore";
import { Separator } from "@radix-ui/react-separator";
import * as Menubar from "@radix-ui/react-menubar";
import { SelectedItem } from "../lib/types";
import { findAnySelected, returnToParent, findCollectionType } from "../lib/selectedStates";
import { 
  HamburgerMenuIcon,
  Pencil1Icon,
  TrashIcon
} from "@radix-ui/react-icons";


const selectedItemModals = {
  game: {
    edit: "editGame",
    delete: "deleteGame"
  },
  player: {
    edit: "editPlayer",
    delete: "deletePlayer"
  },
  roster: {
    edit: "editRoster",
    delete: "deleteRoster"
  }
}


function Header(): JSX.Element {
    const { setExpModal, selected, setExpView, setExpSelected } = useExperienceStore(
      useShallow((state) => ({ 
        setExpView: state.setExpView,
        setExpSelected: state.setExpSelected,
        setExpModal: state.setExpModal,
        selected: state.experience.selected
      })));

      const selectedItem:SelectedItem | null = findAnySelected(selected) || null;
      const name = selectedItem?.name || "BLUMBOTRON • High Scores Made Easy!";
      
      const selectedType = findCollectionType(selectedItem);

    const handleBack = () => {
      returnToParent(selectedItem, setExpView, setExpModal, setExpSelected)
    }

    return (
    <div className="min-h-[80px] min-w-full items-center flex flex-row bg-slate-900 gap-4 px-4">
        <div className="flex-initial min-w-[80px] flex flex-row gap-4 items-center">
         
        </div>
        <div className=" flex-grow text-3xl font-bold">{name}</div>
            {selectedItem && (
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
                        <Menubar.Portal>
                          <Menubar.Content className="bg-slate-700/50 rounded-md p-1 mt-1 min-w-[150px] rounded-md shadow-lg">
                            <Menubar.Item 
                              className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                              onClick={() => setExpModal(selectedItemModals[selectedType as keyof typeof selectedItemModals].edit)}
                            >
                              <div className="flex flex-row gap-2 items-center"><Pencil1Icon width="20" height="20" /> Edit</div>
                            </Menubar.Item>
                            <Menubar.Item 
                              className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                              onClick={() => setExpModal(selectedItemModals[selectedType as keyof typeof selectedItemModals].delete)}
                            >
                              <div className="flex flex-row gap-2 items-center"><TrashIcon width="20" height="20" /> Delete</div>
                            </Menubar.Item>
                          </Menubar.Content>
                        </Menubar.Portal>
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