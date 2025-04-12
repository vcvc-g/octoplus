// src/App.jsx - Updated with API Debug route
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StudentProfileProvider } from './context/StudentProfileContext';
import { useCollegeData } from './hooks/useCollegeData';
import { StudentProfile } from './components/student';
import { UniversityGrid, UniversityDetails } from './components/university';
import { BackgroundEffects, Header } from './components/ui';
import Sidebar from './components/ui/Sidebar';
import UniversityVoiceChat from './pages/UniversityVoiceChat';
import ApiDebugPage from './pages/ApiDebugPage'; // Import the new debug page

// Create a UniversityExplorer component for the main page
const UniversityExplorer = () => {
  const animateBackground = true;
  const [highlightGlow, setHighlightGlow] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterAcceptance, setFilterAcceptance] = useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Use the enhanced hook to fetch university data
  const {
    universities,
    loading,
    error,
    apiConfigured,
    fetchUniversities,
    fetchUniversityById,
    pagination
  } = useCollegeData();

  // Fetch detailed data when a university is selected
  useEffect(() => {
    if (selectedUniversity) {
      const fetchDetailedUniversity = async () => {
        try {
          const detailedUniversity = await fetchUniversityById(selectedUniversity.id);
          if (detailedUniversity) {
            setSelectedUniversity(detailedUniversity);
          }
        } catch (err) {
          console.error("Failed to fetch detailed university data:", err);
        }
      };

      fetchDetailedUniversity();
    }
  }, [selectedUniversity, fetchUniversityById]);

  // Apply filters when they change
  const applyFilters = useCallback(() => {
    fetchUniversities({
      searchTerm,
      filterRegion,
      filterType,
      filterAcceptance,
      page: 1 // Reset to first page on filter change
    });
  }, [fetchUniversities, searchTerm, filterRegion, filterType, filterAcceptance]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    if (pagination) {
      pagination.goToPage(page);
    }
  }, [pagination]);

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

      {/* API Status Banner (only show if there's an error) */}
      {error && (
        <div className="bg-red-900/80 text-white text-sm py-1 px-4 text-center">
          {error}
          {!apiConfigured && " API key not configured or invalid."}
        </div>
      )}

      {/* Enhanced Header with advanced search */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRegion={filterRegion}
        setFilterRegion={setFilterRegion}
        filterType={filterType}
        setFilterType={setFilterType}
        filterAcceptance={filterAcceptance}
        setFilterAcceptance={setFilterAcceptance}
        onSearch={applyFilters}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
      />

      {/* Student Profile Component */}
      <StudentProfile />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced University grid with pagination */}
        <UniversityGrid
          universities={universities}
          selectedUniversity={selectedUniversity}
          onUniversityClick={(university) => setSelectedUniversity(university)}
          highlightGlow={highlightGlow}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          error={error}
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
              <Route path="/voice-chat" element={<UniversityVoiceChat />} />
              <Route path="/api-debug" element={<ApiDebugPage />} /> {/* New route for API debugging */}
            </Routes>
          </div>
        </div>
      </Router>
    </StudentProfileProvider>
  );
}

export default App;