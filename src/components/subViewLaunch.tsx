import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Menubar from '@radix-ui/react-menubar';
import UpdateScore from './widgetUpdateScore';
import DisplayFrame from './displayFrame';
import { GameDataItem } from '../lib/types';
import { useGameStore } from '../stores/gamesStore';
import { useRef, useEffect, useState } from 'react';
import { PlusCircledIcon, TableIcon, IdCardIcon } from '@radix-ui/react-icons';
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

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollViewportRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollViewportRef.current.offsetLeft);
    setScrollLeft(scrollViewportRef.current.scrollLeft);
    scrollViewportRef.current.style.cursor = 'grabbing';
    scrollViewportRef.current.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollViewportRef.current) {
      scrollViewportRef.current.style.cursor = 'grab';
      scrollViewportRef.current.style.userSelect = '';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollViewportRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollViewportRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiply for faster scrolling
    scrollViewportRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const addNewDisplay = async (type: 'table' | 'slide') => {
    if (!currentGameData || !currentGameData.snowflake) {
      console.error('No game data or snowflake available');
      return;
    }
    const newDisplayItem = {
      ...defaultDisplayData,
      category: type,
      title: `${type} ${(currentGameData.data?.displays?.length || 0) + 1}`,
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
      <ScrollArea.Root type="always" className="w-full rounded bg-slate-700/50 mb-2">
        <ScrollArea.Viewport
          ref={scrollViewportRef}
          className="w-full rounded pb-4"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            scrollSnapType: 'x mandatory',
            scrollBehavior: isDragging ? 'auto' : 'smooth',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-row items-center justify-start gap-1">
            {currentGameData?.data?.displays && currentGameData.data.displays.length > 0 &&
              currentGameData.data.displays.map((_, index) => (
                <div
                  ref={containerRef}
                  className="
                    p-4
                    overflow-y-hidden
                    min-h-[calc(50vh-120px)]
                    max-h-[calc(50vh-120px)]
                    flex-shrink-0
                  "
                  style={{ scrollSnapAlign: 'start' }}
                  key={`displayItem_${index}`}
                >
                  <DisplayFrame
                    height={containerHeight}
                    game={currentGameData?.snowflake}
                    displayIndex={index}
                  />
                </div>
              ))}
            <div
              className="
                flex
                min-h-[calc(50vh-120px)]
                flex-shrink-0
                pt-4
                pb-4
              "
              style={{ scrollSnapAlign: 'start' }}
            >
              <Menubar.Root className="flex rounded-md">
                <Menubar.Menu>
                  <Menubar.Trigger
                    className="flex select-none items-center justify-center cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700 hover:bg-sky-600 min-h-full"
                    onClick={() => {}}
                  >
                    <PlusCircledIcon width="20" height="20" />
                  </Menubar.Trigger>
                  <Menubar.Portal>
                    <Menubar.Content className="bg-slate-700/50 rounded-md p-1 mt-1 min-w-[150px] shadow-lg z-[9999]">
                      <Menubar.Item
                        className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                        onClick={() => addNewDisplay('table')}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <TableIcon width="20" height="20" /> New Table
                        </div>
                      </Menubar.Item>
                      <Menubar.Item
                        className="cursor-pointer bg-slate-600/50 hover:bg-blue-600/20 rounded-md p-1 m-1"
                        onClick={() => addNewDisplay('slide')}
                      >
                        <div className="flex flex-row gap-2 items-center">
                          <IdCardIcon width="20" height="20" /> New Slide
                        </div>
                      </Menubar.Item>
                    </Menubar.Content>
                  </Menubar.Portal>
                </Menubar.Menu>
              </Menubar.Root>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-gray-700/75 p-0.5 transition-colors duration-[160ms] ease-out h-3"
          orientation="horizontal"
          forceMount
        >
          <ScrollArea.Thumb className="bg-gray-500 rounded-[10px]" />
        </ScrollArea.Scrollbar>
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
          className="flex touch-none select-none bg-gray-700/75 p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="relative flex-1 bg-gray-500 rounded-[10px] before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  );
}

export default SubViewLaunch;
