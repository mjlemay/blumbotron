import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainViewer from './components/mainViewer';
import ViewDisplay from './components/viewDisplay';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/display" element={<ViewDisplay />} />
          <Route path="*" element={
            <div className="h-screen w-screen overflow-hidden bg-black">
              <MainViewer />
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
