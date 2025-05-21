import ListContainer from "./listContainer";
import { useEffect } from "react";
import { useGameStore } from "../stores/gamesStore";
import * as Menubar from "@radix-ui/react-menubar";
import { PersonIcon, PlusCircledIcon, TableIcon } from "@radix-ui/react-icons";
import DisplayListItem from "./displayListItem";
import { DisplayData } from "../lib/types";
import { useExperienceStore } from "../stores/experienceStore";
type ViewHomeProps = {
    children?: React.ReactNode;
}

const mockData2 = [
    {
        id: 1,
        name: "DnD Players",
        category: "roster",
        description: "People to play DnD with.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
    },
    {
        id: 2,
        name: "SmashCon 2006",
        category: "roster",
        description: "Smash Bros players.",
        createdAt: "2023-02-01",
        updatedAt: "2023-02-02",
    },
    {
        id: 3,
        name: "LARP Crew",
        category: "roster",
        description: "People to LARP with.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",}
];

function ViewHome(props: ViewHomeProps): JSX.Element  {
  const { games, loading, error, fetchGames } = useGameStore();
  const { setExpModal } = useExperienceStore();

  useEffect(() => {
    fetchGames();
  }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    

  return (
    <div className="flex flex-row gap-4 overflow-hidden max-h-ful m-2">
      <div className="flex-item">
        <ListContainer items={games as unknown as DisplayData[]} listItem={DisplayListItem} title="Tables & Displays">
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <TableIcon width="20" height="20" /> <span>Manage Tables</span>
                        </Menubar.Trigger>
                        <Menubar.Trigger 
                        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700"
                        onClick={() => setExpModal("newGame")}
                        >
                            <PlusCircledIcon 
                              width="20"
                              height="20"
                              onClick={() => setExpModal("game")}
                            /> <span>Create New Game</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
      <div className="flex-item ">
        <ListContainer items={mockData2} listItem={DisplayListItem} title="Player Rosters">
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <PersonIcon width="20" height="20" /> <span>Manage Players</span>
                        </Menubar.Trigger>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <PlusCircledIcon
                              width="20"
                              height="20"
                            /> <span>Create New Roster</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
      <>{props.children}</>
    </div>
  );
}

export default ViewHome;