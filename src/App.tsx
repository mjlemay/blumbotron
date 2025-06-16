import './App.css';
import MainViewer from './components/mainViewer';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-black">
        <MainViewer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
