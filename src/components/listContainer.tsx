import { ScrollArea } from "radix-ui";

type ListItem = {
    id: number;
    name: string;
    description: string;
    dateCreated: string;
    lastUpdated: string;
}

type ListContainerProps ={
    items?: ListItem[];
    title?: string;
    children?: React.ReactNode;
}

function ListContainer(props: ListContainerProps): JSX.Element {
    const { items = [], title, children } = props;



    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900/40 rounded-lg shadow-lg">
            <div className={`min-w-[46vw] bg-slate-600 
                ${children ? 'rounded-tr-lg rounded-tl-lg' : 'rounded-lg'} 
                shadow-md p-4`}>
                {title && (<h2 className="text-3xl font-thin pl-2 pb-2">{title}</h2>)}
     
                {items.length === 0 ? 
                (
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-center text-slate-400">No items to display</p>
                    </div>
                ) : (
	                <ScrollArea.Root className="w-full h-[100vh] max-h-[75vh] rounded bg-slate-700/50 overflow-hidden">
		                <ScrollArea.Viewport className="size-full rounded">
                            <div className="px-5 py-[15px]">
                                {items.map((item) => (
                                    <div key={`${item.id}_${item.name}`} className="flex flex-col items-start justify-start bg-slate-700 rounded-lg shadow-lg p-4 m-2">
                                        <h3 className="text-xl font-bold">{item.name}</h3>
                                        <p>{item.description}</p>
                                        <p>Date Created: {item.dateCreated}</p>
                                        <p>Last Updated: {item.lastUpdated}</p>
                                    </div>
                                ))}
                            </div>
		                </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar
                            className="flex touch-none select-none bg-gray-700/75 p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
                            orientation="vertical"
                        >
                            <ScrollArea.Thumb className="relative flex-1 bg-gray-500 rounded-[10px] before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
                        </ScrollArea.Scrollbar>
		                <ScrollArea.Scrollbar
                            className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
                            orientation="horizontal"
                        >
                            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
                        </ScrollArea.Scrollbar>
		                <ScrollArea.Corner className="bg-blackA5" />
	                </ScrollArea.Root>
                )}
            </div>
            {children && (
                <div className="flex flex-row h-[80px] h-min-[80px] w-full items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
  }
  
  export default ListContainer;


  