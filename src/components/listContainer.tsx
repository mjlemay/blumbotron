import * as ScrollArea from '@radix-ui/react-scroll-area';
import { DataItem } from '../lib/types';

type ListContainerProps = {
  children?: React.ReactNode;
  form?: React.ReactNode;
  items?: DataItem[];
  fullWidth?: boolean;
  menuBar?: 'top' | 'bottom';
  listItem?: React.ComponentType<{ item: DataItem; key: string }>;
  title?: string;
  dialog?: React.ReactNode;
};

function ListContainer(props: ListContainerProps): JSX.Element {
  const { dialog = null, items = [], listItem, title, menuBar, fullWidth, children } = props;

  const mapListData = (
    items: DataItem[],
    ListItemComponent?: React.ComponentType<{ item: DataItem; key: string }> | undefined
  ) => {
    return items.map((item) => {
      if (ListItemComponent) {
        return <ListItemComponent key={`item_${item.id}_${item.name}`} item={item} />;
      } else {
        return (
          <div
            key={`${item.id}_${item.name}`}
            className="flex flex-col items-start justify-start bg-slate-700 rounded-lg shadow-lg p-4 m-2"
          >
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p>{item.description}</p>
            <p>Date Created: {item.created_at}</p>
            <p>Last Updated: {item.updated_at}</p>
          </div>
        );
      }
    });
  };

  return (
    <div className={`flex flex-col items-center h-[calc(100vh-100px)] bg-slate-900/40 rounded-lg shadow-lg`}>
      {menuBar === 'top' && children && (
        <div className="flex flex-row h-[80px] shrink-0 h-min-[80px] w-full items-center justify-center">
          {children}
        </div>
      )}
      <div
        className={`min-w-[46vw] bg-slate-600 shrink
          ${children ? ( menuBar !== 'top' ? 'rounded-tr-lg rounded-tl-lg' : 'rounded-br-lg rounded-bl-lg') : 'rounded-lg'}
          shadow-md p-4 flex flex-col h-full`}
      >
        {title && <h2 className="text-3xl font-thin pl-2 pb-2">{title}</h2>}
        {dialog && <div className="flex flex-col items-center justify-center h-full">{dialog}</div>}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-center text-slate-400">No items to display</p>
          </div>
        ) : (
          <ScrollArea.Root className={`w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-hidden ${fullWidth ? 'min-w-[calc(100vw-130px)]' : 'min-w-[46vw]'}`}>
            <ScrollArea.Viewport className="h-full w-full rounded">
              <div className={`px-5 py-[15px] ${children && 'max-h-[calc(100vh-300px)]'}`}>
                {mapListData(items, listItem)}
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
      {menuBar !== 'top' && children && (
        <div className="flex flex-row h-[80px] shrink-0 h-min-[80px] w-full items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default ListContainer;
