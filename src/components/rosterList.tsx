import { Menubar } from "radix-ui";
import { PersonIcon, PlusCircledIcon } from "@radix-ui/react-icons";

const mockData = [
    {
        id: 1,
        name: "DnD Night",
        description: "This is the first roster.",
        dateCreated: "2023-01-01",
        lastUpdated: "2023-01-02",
    },
    {
        id: 2,
        name: "Smash Tournament",
        description: "This is the second roster.",
        dateCreated: "2023-02-01",
        lastUpdated: "2023-02-02",
    },
    {
        id: 3,
        name: "LARP Event",
        description: "This is the third roster.",
        dateCreated: "2023-01-01",
        lastUpdated: "2023-01-02",
    },
    {
        id: 4,
        name: "Board Game Night",
        description: "This is the fourth roster.",
        dateCreated: "2023-02-01",
        lastUpdated: "2023-02-02",
    },
];


interface RosterListProps {
    children?: React.ReactNode;
}

function RosterList(props: RosterListProps): JSX.Element {
    const { children } = props;

    const itemRow = (item: any) => {
        return (
            <div key={item.id} className="flex flex-col items-start justify-start bg-slate-700 rounded-lg shadow-lg p-4 m-2">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <p>{item.description}</p>
                <p>Date Created: {item.dateCreated}</p>
                <p>Last Updated: {item.lastUpdated}</p>
            </div>
        );
    }

    const myRosters = mockData.map((item) => {
        return itemRow(item);
    });

    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900/40 rounded-lg shadow-lg">

            <div className="min-h-[50vh] min-w-[46vw] bg-slate-600 rounded-tr-lg rounded-tl-lg shadow-md p-4">
                <h2 className="text-3xl font-thin pl-2">Game Rosters</h2>
                {myRosters}
            </div>
            <div>
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
            </div>
            <div>
                {children}
            </div>
        </div>
    );
  }
  
  export default RosterList;


  