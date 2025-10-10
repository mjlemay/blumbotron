import './App.css';
import { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';

// Lazy load the DisplayTableWrapper to avoid loading stores until needed
const DisplayTableWrapper = lazy(() => import('./components/displayTableWrapper'));

function ViewerApp() {
  try {
    const [isDisplayMode, setIsDisplayMode] = useState(false);
    const [game, setGame] = useState<string | undefined>(undefined);

    useEffect(() => {
      // Parse URL parameters to determine mode and game
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const gameParam = urlParams.get('game');
      
      if (mode === 'display') {
        setIsDisplayMode(true);
        setGame(gameParam || undefined);
      }
    }, []);

    if (isDisplayMode) {
      return (
        <div className="flex w-screen h-screen bg-black text-white">
          <div className="flex flex-1 items-center justify-center">
            <Suspense fallback={
              <div className="text-center">
                <div className="text-white text-lg mb-2">Loading Display...</div>
                <div className="text-sm text-gray-400">Initializing game data...</div>
              </div>
            }>
              <DisplayTableWrapper game={game} fetchIntervalSeconds={10} />
            </Suspense>
          </div>
        </div>
      );
    }

    return (
      <div className="flex w-screen h-screen bg-neutral-900 text-white items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Blumbotron Viewer</h1>
          <div className="text-gray-400">Ready for display mode</div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Error in ViewerApp:', err);
    return (
      <div className="flex w-screen h-screen bg-red-900 text-white items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Display Error</h1>
          <p className="text-red-200">Unable to load display window</p>
        </div>
      </div>
    );
  }


}

export default ViewerApp;
