import UiButton from "./uiButton";

const mockData = [
    {
        id: 1,
        name: "Project 1",
        description: "This is the first project.",
        dateCreated: "2023-01-01",
        lastUpdated: "2023-01-02",
    },
    {
        id: 2,
        name: "Project 2",
        description: "This is the second project.",
        dateCreated: "2023-02-01",
        lastUpdated: "2023-02-02",
    },
    {
        id: 3,
        name: "Project 3",
        description: "This is the third project.",
        dateCreated: "2023-01-01",
        lastUpdated: "2023-01-02",
    },
    {
        id: 4,
        name: "Project 4",
        description: "This is the fourth project.",
        dateCreated: "2023-02-01",
        lastUpdated: "2023-02-02",
    },
];


interface ProjectListProps {
    children?: React.ReactNode;
}

function ProjectList(props: ProjectListProps): JSX.Element {
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

    const myProjects = mockData.map((item) => {
        return itemRow(item);
    });

    return (
        <div className="flex flex-col items-center justify-center h-full">

            <div className="min-h-[50vh] min-w-[46vw] bg-slate-600 rounded-lg shadow-lg p-4">
                <h2 className="text-3xl font-thin pl-2">Display Tables</h2>
                {myProjects}
            </div>
            <div>
                <UiButton uiIcon="add" clickHandler={() => {}} />
            </div>
            <div>
                {children}
            </div>
        </div>
    );
  }
  
  export default ProjectList;