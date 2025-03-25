// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext';
import { universities } from './data/universities';
import { filterOptions } from './data/filterOptions';
import { useUniversityFilter } from './hooks/useUniversityFilter';
import { StudentProfile } from './components/student';
import { UniversityGrid, UniversityDetails } from './components/university';
import { BackgroundEffects, Header } from './components/ui';
import Sidebar from './components/ui/Sidebar';
import VoiceChat from './pages/VoiceChat';

// Create a UniversityExplorer component for the main page
const UniversityExplorer = () => {
  const animateBackground = true;
  const [highlightGlow, setHighlightGlow] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const {
    searchTerm,
    setSearchTerm,
    filterRegion,
    setFilterRegion,
    filterType,
    setFilterType,
    filterAcceptance,
    setFilterAcceptance,
    filteredUniversities
  } = useUniversityFilter(universities);

  // Background animation effect
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setHighlightGlow(prev => !prev);
    }, 2000);

    return () => clearInterval(glowInterval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <BackgroundEffects animateBackground={animateBackground} />

      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRegion={filterRegion}
        setFilterRegion={setFilterRegion}
        filterType={filterType}
        setFilterType={setFilterType}
        filterAcceptance={filterAcceptance}
        setFilterAcceptance={setFilterAcceptance}
      />

      {/* Student Profile Component */}
      <StudentProfile />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* University grid */}
        <UniversityGrid
          universities={filteredUniversities}
          selectedUniversity={selectedUniversity}
          onUniversityClick={(university) => setSelectedUniversity(university)}
          highlightGlow={highlightGlow}
        />

        {/* University details */}
        <UniversityDetails university={selectedUniversity} />
      </div>
    </div>
  );
};

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
              <Route path="/" element={<UniversityExplorer />} />
              <Route path="/voice-chat" element={<VoiceChat />} />
            </Routes>
          </div>
        </div>
      </Router>
    </StudentProfileProvider>
  );
}

export default App;