import "./App.css";
import MainViewer from "./components/mainViewer";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {

  return (
    <ErrorBoundary>
      <div>
        <MainViewer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
