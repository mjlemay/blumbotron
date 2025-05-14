import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from "@tauri-apps/api/window";

interface FullScreenViewerProps {
  children?: React.ReactNode;
  isFullScreen: boolean;
  actionHandler?: Function;
}
  
export default function FullScreenViewer(props:FullScreenViewerProps):JSX.Element {
  const { children, isFullScreen, actionHandler = ()=>{} } = props;
  const [ hasFullScreen, setHasFullScreen ] = useState(false);

  const goFullScreen = async (toggle:boolean) => {
    await getCurrentWindow().setFullscreen(toggle);
  }

  useEffect(()=> { 
    if (isFullScreen && !hasFullScreen) {
        goFullScreen(true);
        setHasFullScreen(true);
    }
    if (!isFullScreen && hasFullScreen) {
        goFullScreen(false);
        setHasFullScreen(false);
    }
   }, [isFullScreen, hasFullScreen]);
  
  return (
    <>
    {isFullScreen && (
        <div id="fullScreenViewer" className="absolute top-0 left-0"  onClick={()=> {actionHandler('closeFullScreen')}}>
            <div className="w-screen h-screen bg-blue-700">
                {children}
                <h1>HELLO WORLD</h1>
            </div>
        </div>
    )}
    </>
  )
}