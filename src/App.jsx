// src/App.jsx - Updated with all new providers and features
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import Sidebar from './components/ui/Sidebar.jsx';
import UniversityVoiceChat from './pages/UniversityVoiceChat.jsx';
import ApiDebugPage from './pages/ApiDebugPage.jsx';
import UniversityExplorer from './pages/UniversityExplorer.jsx';

function App() {
  return (
    <StudentProfileProvider>
      <FavoritesProvider>
        <Router>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

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