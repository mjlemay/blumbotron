import { useShallow } from 'zustand/react/shallow';
import { useExperienceStore } from '../stores/experienceStore';
import { useGameStore } from '../stores/gamesStore';
import { useRosterStore } from '../stores/rostersStore';
import { usePlayerStore } from '../stores/playersStore';
import { Separator } from '@radix-ui/react-separator';
import { PersonIcon } from '@radix-ui/react-icons';
import { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import * as ScrollArea from '@radix-ui/react-scroll-area';

function ViewPlayer() {
  const { selected, setExpView, setExpSelected } = useExperienceStore(
    useShallow((state) => ({ 
      selected: state.experience.selected, 
      setExpView: state.setExpView,
      setExpSelected: state.setExpSelected
    }))
  );
  
  const { games, fetchGames } = useGameStore();
  const { rosters, fetchRosters } = useRosterStore();
  const { players, fetchPlayers, editPlayer } = usePlayerStore();
  
  const [playerImageSrc, setPlayerImageSrc] = useState<string>('');
  
  // Get the fresh player data from the players store instead of just the selected state
  const selectedPlayerFromStore = selected?.player || null;
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerFromStore) return null;
    // Find the updated player data from the players store
    return players.find(p => p.snowflake === selectedPlayerFromStore.snowflake) || selectedPlayerFromStore;
  }, [players, selectedPlayerFromStore]);
  
  const { name = '', id = '', snowflake, created_at, updated_at } = selectedPlayer || {};

  // Load player image
  const loadPlayerImage = async (imageFileName?: string) => {
    const fileName = imageFileName || (selectedPlayer?.data as any)?.avatarImage;
    if (fileName) {
      try {
        // If it's already a data URL, use it directly
        if (fileName.startsWith('data:')) {
          setPlayerImageSrc(fileName);
          return;
        }
        
        // Otherwise, load from Tauri backend
        const dataUrl = await invoke('get_background_image_data', { fileName: fileName }) as string;
        setPlayerImageSrc(dataUrl);
      } catch (error) {
        console.error('Failed to load player image:', fileName, error);
        setPlayerImageSrc('');
      }
    } else {
      setPlayerImageSrc('');
    }
  };

  // Fetch data when component mounts or player changes
  useEffect(() => {
    if (selectedPlayerFromStore) {
      fetchGames();
      fetchRosters();
      fetchPlayers(); // Ensure we have fresh player data
    }
  }, [selectedPlayerFromStore, fetchGames, fetchRosters, fetchPlayers]);

  // Load player image when selectedPlayer data changes (including updates)
  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerImage();
    }
  }, [selectedPlayer]);

  // Find games where this player can participate
  const availableGames = games.filter(game => {
    // If game has no roster, all players can participate
    if (!game.roster) {
      return true;
    }
    
    // Find the roster for this game
    const gameRoster = rosters.find(roster => roster.snowflake === game.roster);
    if (!gameRoster) {
      return true; // If roster doesn't exist, assume all players can participate
    }
    
    // Check if player is in the allow list (or allow list is empty)
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // If player is explicitly denied, they can't participate
    if (gameRoster.deny && gameRoster.deny.includes(playerSnowflake)) {
      return false;
    }
    
    // If there's an allow list and player is not in it, they can't participate
    if (gameRoster.allow && gameRoster.allow.length > 0 && !gameRoster.allow.includes(playerSnowflake)) {
      return false;
    }
    
    return true;
  });

  // Find games where this player is banned
  const bannedGames = games.filter(game => {
    if (!game.roster) {
      return false; // Can't be banned from games with no roster
    }
    
    const gameRoster = rosters.find(roster => roster.snowflake === game.roster);
    if (!gameRoster) {
      return false;
    }
    
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is banned if they're in the deny list
    if (gameRoster.deny && gameRoster.deny.includes(playerSnowflake)) {
      return true;
    }
    
    // Player is also effectively banned if there's an allow list and they're not in it
    if (gameRoster.allow && gameRoster.allow.length > 0 && !gameRoster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    return false;
  });

  // Function to navigate to a game's detail page
  const navigateToGame = (game: any) => {
    setExpSelected({ game });
    setExpView('game');
  };

  // Find rosters where this player is included
  const includedRosters = rosters.filter(roster => {
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is included if they're in the allow list or if allow list is empty and they're not in deny list
    if (roster.allow && roster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    // If no allow list, player is included unless they're in deny list
    if (!roster.allow || roster.allow.length === 0) {
      return !roster.deny || !roster.deny.includes(playerSnowflake);
    }
    
    return false;
  });

  // Find rosters where this player is banned
  const bannedRosters = rosters.filter(roster => {
    const playerSnowflake = selectedPlayer?.snowflake;
    if (!playerSnowflake) {
      return false;
    }
    
    // Player is banned if they're in the deny list
    if (roster.deny && roster.deny.includes(playerSnowflake)) {
      return true;
    }
    
    // Player is also effectively banned if there's an allow list and they're not in it
    if (roster.allow && roster.allow.length > 0 && !roster.allow.includes(playerSnowflake)) {
      return true;
    }
    
    return false;
  });

  return (
    <div key={`${id}-${name}`} className="h-[calc(100vh-8rem)] overflow-hidden">
      <div
        className="
          flex 
          flex-col
          h-full
          min-w-[calc(100vw-8rem)]
          bg-slate-600
          justify-start
          rounded-lg
          p-2 m-2
          pt-4
          shadow-lg
          overflow-y-auto
        "
      >
        <div className="w-full rounded bg-slate-700 p-4 mb-4 shadow-lg">
          <div className="flex flex-row items-center gap-4 mb-2">
            {/* Player Image */}
            <div className="relative">
              {playerImageSrc ? (
                <img
                  src={playerImageSrc}
                  alt={`${name} avatar`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center border-2 border-slate-500">
                  <PersonIcon className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>
            
            {/* Player Info */}
            <div>
              <h2 className="text-3xl font-thin flex flex-row items-center gap-2">
                {name}
                {snowflake && <span className="text-2xl text-slate-400">#{snowflake}</span>}
              </h2>
            </div>
          </div>
          <div className="w-full text-slate-400 flex flex row items-center gap-2 justify-start">
            {created_at && (
              <span>
                <label className="text-slate-500">Created</label> {created_at}
              </span>
            )}
            {created_at && updated_at && (
              <Separator className="w-[1px] h-4 bg-slate-500" orientation="vertical" decorative />
            )}
            {updated_at && (
              <span>
                <label className="text-slate-500">Updated</label> {updated_at}
              </span>
            )}
          </div>
        </div>
        <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-hidden mb-2">
          <ScrollArea.Viewport className="h-full w-full rounded p-4">
            <div className="w-full">
              <h3 className="text-2xl font-thin pl-2 pb-2">Included in Games</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {availableGames.length > 0 ? (
                  availableGames.map(game => (
                    <div 
                      key={game.snowflake || game.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                      onClick={() => navigateToGame(game)}
                    >
                      <span className="text-white font-medium">{game.name}</span>
                      {game.roster && (
                        <span className="text-slate-300 text-sm ml-2">
                          (via roster)
                        </span>
                      )}
                      {!game.roster && (
                        <span className="text-green-300 text-sm ml-2">
                          (open to all)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No games found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Games</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {bannedGames.length > 0 ? (
                  bannedGames.map(game => (
                    <div 
                      key={game.snowflake || game.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                      onClick={() => navigateToGame(game)}
                    >
                      <span className="text-white font-medium">{game.name}</span>
                      <span className="text-red-200 text-sm ml-2">
                        (restricted)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No games found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Included in Rosters</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {includedRosters.length > 0 ? (
                  includedRosters.map(roster => (
                    <div 
                      key={roster.snowflake || roster.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                    >
                      <span className="text-white font-medium">{roster.name}</span>
                      {roster.allow && roster.allow.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-blue-200 text-sm ml-2">
                          (explicitly allowed)
                        </span>
                      )}
                      {(!roster.allow || roster.allow.length === 0) && (
                        <span className="text-blue-200 text-sm ml-2">
                          (default access)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No rosters found.</p>
                )}
              </div>
              <h3 className="text-2xl font-thin pl-2 pb-2">Banned in Rosters</h3>
              <div className="flex flex-wrap gap-2 p-1 mb-4">
                {bannedRosters.length > 0 ? (
                  bannedRosters.map(roster => (
                    <div 
                      key={roster.snowflake || roster.id} 
                      className="bg-slate-500 hover:bg-slate-400 transition-colors duration-200 rounded px-3 py-2 cursor-pointer"
                    >
                      <span className="text-white font-medium">{roster.name}</span>
                      {roster.deny && roster.deny.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-red-200 text-sm ml-2">
                          (explicitly denied)
                        </span>
                      )}
                      {roster.allow && roster.allow.length > 0 && !roster.allow.includes(selectedPlayer?.snowflake || '') && (
                        <span className="text-red-200 text-sm ml-2">
                          (not in allow list)
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 p-1 text-lg">No rosters found.</p>
                )}
              </div>
              
              {/* Camera Preview Section */}
              <div className="mt-8 pt-4 border-t border-slate-600">
                <h3 className="text-2xl font-thin pl-2 pb-2">Camera Preview</h3>
                <CameraPreview 
                  selectedPlayer={selectedPlayer} 
                  editPlayer={editPlayer}
                  setExpSelected={setExpSelected}
                  loadPlayerImage={loadPlayerImage}
                />
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
            className="flex touch-none select-none bg-slate-700/75 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-slate-600/75 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-slate-500 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-slate-700/50" />
        </ScrollArea.Root>
      </div>
    </div>
  );
}

// Camera Preview Component
function CameraPreview({ 
  selectedPlayer, 
  editPlayer, 
  setExpSelected, 
  loadPlayerImage 
}: { 
  selectedPlayer: any;
  editPlayer: (player: any) => Promise<void>;
  setExpSelected: (selection: any) => void;
  loadPlayerImage: (fileName?: string) => Promise<void>;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<string[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewStreamId, setPreviewStreamId] = useState<string>('');
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [frameUpdateInterval, setFrameUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialize camera system on component mount
  useEffect(() => {
    initializeCameraSystem();
  }, []);

  const initializeCameraSystem = async () => {
    try {
      await invoke('initialize_camera_system');
      const cameras = await invoke('get_available_cameras') as string[];
      setAvailableCameras(cameras);
      if (cameras.length > 0) {
        setSelectedCamera(cameras[0]);
      }
      setIsInitialized(true);
      setError('');
    } catch (err) {
      console.error('Failed to initialize camera system:', err);
      setError('Failed to initialize camera system');
    }
  };

  const startPreview = async () => {
    if (!selectedCamera) return;
    
    console.log('Starting camera preview for:', selectedCamera);
    
    try {
      const streamId = await invoke('start_camera_preview', { cameraId: selectedCamera }) as string;
      console.log('Camera preview started with stream ID:', streamId);
      setPreviewStreamId(streamId);
      setIsPreviewActive(true);
      setError('');
    } catch (err) {
      console.error('Failed to start camera preview:', err);
      setError(`Failed to start camera preview: ${err}`);
    }
  };

  const stopPreview = async () => {
    if (!previewStreamId) return;
    
    // Stop frame updates
    if (frameUpdateInterval) {
      clearInterval(frameUpdateInterval);
      setFrameUpdateInterval(null);
    }
    
    try {
      await invoke('stop_camera_preview', { streamId: previewStreamId });
      setIsPreviewActive(false);
      setPreviewStreamId('');
      setCurrentFrame('');
    } catch (err) {
      console.error('Failed to stop camera preview:', err);
      setError('Failed to stop camera preview');
    }
  };

  // Function to fetch a single frame from the camera
  const fetchCameraFrame = async () => {
    if (!selectedCamera || !isPreviewActive) return;
    
    try {
      console.log('Fetching frame from camera:', selectedCamera);
      const frameData = await invoke('get_camera_frame', { cameraId: selectedCamera }) as string;
      console.log('Received frame data:', frameData ? `${frameData.substring(0, 50)}...` : 'No data');
      setCurrentFrame(frameData);
    } catch (err) {
      console.error('Failed to fetch camera frame:', err);
      setError(`Frame error: ${err}`);
    }
  };

  // Start frame updates when preview becomes active
  useEffect(() => {
    if (isPreviewActive && selectedCamera && !frameUpdateInterval) {
      console.log('Starting frame updates for camera preview');
      
      // Start fetching frames every 200ms (5 FPS) for smooth video
      const interval = setInterval(fetchCameraFrame, 200);
      setFrameUpdateInterval(interval);
      
      // Fetch the first frame immediately
      fetchCameraFrame();
    }
    
    return () => {
      if (frameUpdateInterval) {
        clearInterval(frameUpdateInterval);
      }
    };
  }, [isPreviewActive, selectedCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameUpdateInterval) {
        clearInterval(frameUpdateInterval);
      }
    };
  }, []);

  const capturePhoto = async () => {
    if (!selectedCamera) return;
    
    try {
      const photoData = await invoke('capture_photo_from_camera', { cameraId: selectedCamera }) as string;
      setCapturedPhoto(photoData);
      setError('');
      
      // Save the photo and set as player avatar
      if (selectedPlayer && photoData !== "data:image/jpeg;base64,placeholder_image_data") {
        const base64Data = photoData.split(',')[1];
        const fileName = `player_${selectedPlayer.snowflake || selectedPlayer.id}_camera_${Date.now()}.jpg`;
        
        // Save the image file
        await invoke('save_background_image', {
          fileName,
          imageData: base64Data
        });
        
        // Update player data with the new avatar
        const updatedPlayer = {
          ...selectedPlayer,
          data: {
            ...selectedPlayer.data,
            avatarImage: fileName
          }
        };

        // Update player in database
        await editPlayer(updatedPlayer);
        
        // Update the selected player in the experience store
        setExpSelected({ player: updatedPlayer });
        
        // Reload the player image to show the new avatar immediately
        loadPlayerImage(fileName);
        
        alert(`Photo captured and set as avatar for ${selectedPlayer.name}!`);
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError('Failed to capture photo');
    }
  };

  if (!isInitialized) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-center">
          <p className="text-slate-400">Initializing camera system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={initializeCameraSystem}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="space-y-4">
        {/* Important Note */}
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="text-blue-400 mt-0.5">💡</div>
            <div className="text-blue-100">
              <strong>Camera Tip:</strong> For best results, close other camera apps (FaceTime, Zoom, etc.) and run only one Blumbotron instance at a time.
            </div>
          </div>
        </div>

        {/* Camera Selection */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Select Camera ({availableCameras.length} detected):
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableCameras.map((camera, index) => (
              <option key={index} value={camera}>
                {camera}
              </option>
            ))}
          </select>
          <div className="mt-2 text-xs text-slate-400">
            Current selection: {selectedCamera || 'None'}
          </div>
        </div>

        {/* Camera Preview Area */}
        <div className="bg-slate-700 rounded-lg w-80 h-80 mx-auto flex items-center justify-center relative overflow-hidden">
          {capturedPhoto && !capturedPhoto.includes("placeholder_image_data") ? (
            <div className="relative w-full h-full">
              <img 
                src={capturedPhoto} 
                alt="Captured Photo" 
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
                📸 Captured Photo (Square)
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
                📐 Square Crop
              </div>
            </div>
          ) : isPreviewActive && currentFrame ? (
            <div className="relative w-full h-full">
              {/* Camera Feed */}
              <img 
                src={currentFrame} 
                alt="Live Camera Feed" 
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.error('Image load error:', e);
                  setError('Failed to load camera frame');
                }}
                onLoad={() => {
                  console.log('Frame loaded successfully');
                }}
              />
              
              {/* Crop Marks Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner Crop Marks */}
                {/* Top Left */}
                <div className="absolute top-4 left-4">
                  <div className="w-6 h-0.5 bg-white shadow-lg"></div>
                  <div className="w-0.5 h-6 bg-white shadow-lg"></div>
                </div>
                {/* Top Right */}
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-0.5 bg-white shadow-lg ml-auto"></div>
                  <div className="w-0.5 h-6 bg-white shadow-lg ml-auto"></div>
                </div>
                {/* Bottom Left */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-0.5 h-6 bg-white shadow-lg"></div>
                  <div className="w-6 h-0.5 bg-white shadow-lg"></div>
                </div>
                {/* Bottom Right */}
                <div className="absolute bottom-4 right-4">
                  <div className="w-0.5 h-6 bg-white shadow-lg ml-auto"></div>
                  <div className="w-6 h-0.5 bg-white shadow-lg ml-auto"></div>
                </div>
                
                {/* Center Cross Hair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-0.5 bg-white opacity-60 shadow-lg"></div>
                  <div className="w-0.5 h-4 bg-white opacity-60 shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                {/* Grid Lines (Rule of Thirds) */}
                <div className="absolute inset-0 opacity-30">
                  {/* Vertical Lines */}
                  <div className="absolute left-1/3 top-0 w-0.5 h-full bg-white opacity-50 shadow-sm"></div>
                  <div className="absolute right-1/3 top-0 w-0.5 h-full bg-white opacity-50 shadow-sm"></div>
                  {/* Horizontal Lines */}
                  <div className="absolute top-1/3 left-0 h-0.5 w-full bg-white opacity-50 shadow-sm"></div>
                  <div className="absolute bottom-1/3 left-0 h-0.5 w-full bg-white opacity-50 shadow-sm"></div>
                </div>
              </div>
              
              {/* UI Overlays */}
              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 z-10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded z-10">
                {selectedCamera}
              </div>
            </div>
          ) : isPreviewActive ? (
            <div className="text-green-400 text-center">
              <div className="animate-pulse">
                <svg className="mx-auto mb-4 w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-semibold">🎥 Loading Video...</p>
                <p className="text-sm">Connecting to camera</p>
                <p className="text-xs text-slate-400 mt-2">Camera: {selectedCamera}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-center">
              <svg className="mx-auto mb-4 w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <p className="text-lg">Camera Preview</p>
              <p className="text-sm">Click "Start Preview" to see live video</p>
              <p className="text-xs text-green-400">✓ Nokhwa camera system ready</p>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          {!isPreviewActive ? (
            <button
              onClick={startPreview}
              disabled={!selectedCamera}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              📹 Start Preview
            </button>
          ) : (
            <button
              onClick={stopPreview}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              ⏹️ Stop Preview
            </button>
          )}
          
          <button
            onClick={capturePhoto}
            disabled={!selectedCamera}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            📸 Capture Photo
          </button>
          
          {capturedPhoto && (
            <button
              onClick={() => setCapturedPhoto('')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              🗑️ Clear Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewPlayer;
