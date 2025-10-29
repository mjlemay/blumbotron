import * as ScrollArea from '@radix-ui/react-scroll-area';
import UpdateScore from './widgetUpdateScore';
import DisplayFrame from './displayFrame';
import { GameDataItem } from '../lib/types';
import { useGameStore } from '../stores/gamesStore';
import { useRef, useEffect, useState } from 'react';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { defaultDisplayData } from '../lib/defaults';

type LaunchProps = {
  gameData: GameDataItem | null;
};

function SubViewLaunch(props: LaunchProps): JSX.Element {
  const { gameData } = props;
  const { getGameBySnowflake, editGame } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  
  // Get the current game data from the store, fallback to prop
  const currentGameData = gameData?.snowflake ? getGameBySnowflake(gameData.snowflake) || gameData : gameData;

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Subtract 32px (16px top + 16px bottom padding)
        const height = containerRef.current.clientHeight - 32;
        setContainerHeight(height);
      }
    };
    
    const handleWheel = (e: WheelEvent) => {
      if (scrollViewportRef.current) {
        // Prevent default vertical scrolling
        e.preventDefault();
        // Scroll horizontally instead
        scrollViewportRef.current.scrollLeft += e.deltaY;
      }
    };
    
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Add wheel event listener to the scroll viewport
    if (scrollViewportRef.current) {
      scrollViewportRef.current.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      resizeObserver.disconnect();
      if (scrollViewportRef.current) {
        scrollViewportRef.current.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const addNewDisplay = async () => {
    if (!currentGameData || !currentGameData.snowflake) {
      console.error('No game data or snowflake available');
      return;
    }
    const newDisplayItem = {
      ...defaultDisplayData,
      title: `Display ${(currentGameData.data?.displays?.length || 0) + 1}`,
    };
    const updatedGameData = {
      ...currentGameData,
      data: {
        ...currentGameData.data,
        displays: [...(currentGameData.data?.displays || []), newDisplayItem],
      },
    };

    try {
      await editGame(updatedGameData);
    } catch (error) {
      console.error('Failed to add new display:', error);
    }
  };

  return (
    <div>
      <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-hidden mb-2">
        <ScrollArea.Viewport ref={scrollViewportRef} className="h-full w-full rounded">
          <div className="flex flex-row items-center justify-start gap-1">
            {currentGameData?.data?.displays && currentGameData.data.displays.length > 0 &&
              currentGameData.data.displays.map((display, index) => (
                <div
                  ref={containerRef}
                  className="
                    p-4
                    overflow-y-hidden
                    min-h-[calc(50vh-120px)]
                    max-h-[calc(50vh-120px)]
                  "
                >
                  <DisplayFrame 
                    height={containerHeight} 
                    key={`$${display.title || 'displayItem'}_${index}`}
                    game={currentGameData?.snowflake}
                    displayIndex={index}
                  />
                </div>
              ))}
            <div
              className="
              flex
              min-h-[calc(50vh-120px)]
              pt-4
              pb-4
              "
            >
            <button
              className="
                select-none
                items-center
                justify-center
                cursor-pointer
                rounded
                shadow-sm
                text-lg
                font-medium
                bg-sky-700
                p-2
                min-h-full
                hover:bg-sky-600/80
                active:bg-sky-600/90
                disabled:bg-sky-600/50
                disabled:cursor-not-allowed
                transition-colors
                duration-200
              "
              onClick={addNewDisplay}
            >
              <PlusCircledIcon width="20" height="20" />
            </button>
            </div>
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
        <ScrollArea.Corner />
      </ScrollArea.Root>
      <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full rounded">
          <div className="px-5 py-[15px] min-h-[48vh] max-h-[48vh]">
            <div className="flex flex-row items-center justify-start">
              <UpdateScore gameData={gameData} />
            </div>
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
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  );
}

export default SubViewLaunch;
