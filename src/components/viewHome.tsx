import ListContainer from "./listContainer";

import { Menubar } from "radix-ui";
import { PersonIcon, PlusCircledIcon, TableIcon } from "@radix-ui/react-icons";
import DisplayListItem from "./displayListItem";


const mockData = [
    {
        id: 1,
        name: "DnD Night",
        category: "table",
        description: "This is the first roster.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
    },
    {
        id: 2,
        name: "Smash Tournament",
        category: "tourney-bracket",
        description: "This is the second roster.",
        createdAt: "2023-02-01",
        updatedAt: "2023-02-02",
    },
    {
        id: 3,
        name: "LARP Event",
        category: "turn-order",
        description: "This is the third roster.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
    },
    {
        id: 4,
        name: "Board Game Night",
        description: "This is the fourth roster.",
        createdAt: "2023-02-01",
        updatedAt: "2023-02-02",
    },
        {
        id: 5,
        name: "Soup Night",
        description: "This is the fifth roster.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
    },
    {
        id: 6,
        name: "Big Ol Tournament",
        description: "This is the sixth roster.",
        createdAt: "2023-02-01",
        updatedAt: "2023-02-02",
    },
    {
        id: 7,
        name: "LARP Event",
        description: "This is the seventh roster.",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-02",
    },
    {
        id: 4,
        name: "Board Game Party",
        description: "This is the last roster.",
        createdAt: "2023-02-01",
        updatedAt: "2023-02-02",
    },
];

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

function ViewHome() {

  return (
    <div className="flex flex-row gap-4">
      <div className="flex-item">
        <ListContainer items={mockData} listItem={DisplayListItem} title="Tables & Displays">
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <TableIcon width="20" height="20" /> <span>Manage Tables</span>
                        </Menubar.Trigger>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <PlusCircledIcon width="20" height="20" /> <span>Create New Game</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
      <div className="flex-item">
        <ListContainer items={mockData2} listItem={DisplayListItem} title="Player Rosters">
             <Menubar.Root className="flex rounded-md p-2 m-2">
                    <Menubar.Menu>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <PersonIcon width="20" height="20" /> <span>Manage Players</span>
                        </Menubar.Trigger>
                        <Menubar.Trigger className="flex select-none items-center justify-between rounded px-3 py-2 gap-1.5 text-lg m-1 font-medium bg-sky-700">
                            <PlusCircledIcon width="20" height="20" /> <span>Create New Roster</span>
                        </Menubar.Trigger>
                    </Menubar.Menu>
            </Menubar.Root>
        </ListContainer>
      </div>
    </div>
  );
}

export default ViewHome;