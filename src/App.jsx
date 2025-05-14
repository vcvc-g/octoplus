// src/App.jsx - Updated with top navigation
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import TopNavigation from './components/ui/TopNavigation.jsx';
import UniversityVoiceChat from './pages/UniversityVoiceChat.jsx';
import ApiDebugPage from './pages/ApiDebugPage.jsx';
import UniversityExplorer from './pages/UniversityExplorer.jsx';

function App() {
  return (
    <StudentProfileProvider>
      <FavoritesProvider>
        <Router>
          <div className="flex flex-col h-screen">
            {/* Top Navigation */}
            <TopNavigation />

            {/* Main content area */}
            <div className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<UniversityExplorer />} />
                <Route path="/voice-chat" element={<UniversityVoiceChat />} />
                <Route path="/api-debug" element={<ApiDebugPage />} />
              </Routes>
            </div>
          </div>
        </Router>
      </FavoritesProvider>
    </StudentProfileProvider>
  );
}

export default App;