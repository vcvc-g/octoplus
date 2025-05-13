// src/App.jsx - Fixed imports
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext.jsx';
import Sidebar from './components/ui/Sidebar.jsx';
import UniversityVoiceChat from './pages/UniversityVoiceChat.jsx';
import ApiDebugPage from './pages/ApiDebugPage.jsx';
import OriginalExplorer from './pages/OriginalExplorer.jsx';

function App() {
  return (
    <StudentProfileProvider>
      <Router>
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<OriginalExplorer />} />
              <Route path="/voice-chat" element={<UniversityVoiceChat />} />
              <Route path="/api-debug" element={<ApiDebugPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </StudentProfileProvider>
  );
}

export default App;