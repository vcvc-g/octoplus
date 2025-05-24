// src/App.jsx - Updated with full light theme support
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import TopNavigation from './components/ui/TopNavigation.jsx';
import UniversityVoiceChat from './pages/UniversityVoiceChat.jsx';
import ApiDebugPage from './pages/ApiDebugPage.jsx';
import UniversityExplorer from './pages/UniversityExplorer.jsx';

function AppContent() {
  const { isLight } = useTheme();

  return (
    <div className={`flex flex-col h-screen transition-colors duration-200 ${
      isLight ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <TopNavigation />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<UniversityExplorer />} />
          <Route path="/voice-chat" element={<UniversityVoiceChat />} />
          <Route path="/api-debug" element={<ApiDebugPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <StudentProfileProvider>
        <FavoritesProvider>
          <Router>
            <AppContent />
          </Router>
        </FavoritesProvider>
      </StudentProfileProvider>
    </ThemeProvider>
  );
}

export default App;