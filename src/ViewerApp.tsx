import "./App.css";
import FullScreenViewer from "./components/fullScreenViewer.tsx";

function ViewerApp() {

  return (
    <div
    className={`flex w-screen bg-neutral-900 text-white select-none`}
    data-theme={"darkTheme"}
  >
    <div className={`flex flex-1 items-center justify-center`}>
        <FullScreenViewer isFullScreen />
    </div>
  </div>
  );
}

export default ViewerApp;