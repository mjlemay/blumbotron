import DialogContainer from "./dialogContainer";
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePlayerStore } from '../stores/playersStore';
import { useExperienceStore } from '../stores/experienceStore';
import { PlayerDataItem } from '../lib/types';

type FormPlayerProps = {
  action?: string;
  onSuccess?: () => void;
};

function FormPhoto(props: FormPlayerProps): JSX.Element {
  const { action = null, onSuccess = null } = props;
  const { editPlayer } = usePlayerStore();
  const { setExpSelected, experience } = useExperienceStore();
  const selectedPlayer = experience?.selected?.player as PlayerDataItem;

  // Camera state
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
    
    // Cleanup on unmount
    return () => {
      if (frameUpdateInterval) {
        clearInterval(frameUpdateInterval);
      }
      if (previewStreamId) {
        invoke('stop_camera_preview', { streamId: previewStreamId }).catch(console.error);
      }
    };
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
        
        // Success callback and close modal
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError('Failed to capture photo');
    }
  };

  const renderCameraContent = () => {
    if (!isInitialized) {
      return (
        <div className="text-center py-8">
          <p className="text-slate-400">Initializing camera system...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={initializeCameraSystem}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
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
            📸 Capture & Save as Avatar
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

        {/* Selected Player Info */}
        {selectedPlayer && (
          <div className="mt-4 p-3 bg-slate-600 rounded-lg text-center">
            <p className="text-slate-300 text-sm">
              Capturing photo for: <span className="font-bold text-white">{selectedPlayer.name}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  console.log(action, onSuccess);
  return (
    <DialogContainer 
      title="Capture Photo" 
      content={renderCameraContent()}
    />
  );
}

export default FormPhoto;
