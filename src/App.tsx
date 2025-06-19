import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Window } from '@tauri-apps/api/window';
import MainViewer from './components/mainViewer';
import ViewDisplay from './components/viewDisplay';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  useEffect(() => {
    // Check if this is a display window and redirect if needed
    const checkWindowType = async () => {
      try {
        const currentWindow = await Window.getCurrent();
        const label = currentWindow.label;
        
        console.log('App mounted - Window label:', label);
        console.log('Current pathname:', window.location.pathname);
        
        // If this is a display window and we're not already on the display route
        if (label.startsWith('display-') && window.location.pathname !== '/display') {
          console.log('Redirecting to /display for display window');
          window.location.href = '/display';
        } else if (label.startsWith('display-')) {
          console.log('Already on display route for display window');
        } else {
          console.log('Main window - showing main content');
        }
      } catch (error) {
        console.error('Error checking window type:', error);
      }
    };

    checkWindowType();
  }, []);

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