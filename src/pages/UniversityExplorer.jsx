// src/pages/UniversityExplorer.jsx - Updated with light theme support
import React, { useState, useEffect, useCallback } from 'react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { calculateAcceptanceChance } from '../utils/admissionsCalculator';
import { BackgroundEffects } from '../components/ui';
import { StudentProfile } from '../components/student';
import { EnhancedUniversityCard, SimpleUniversityDetails } from '../components/university';
import UniversityComparison from '../components/university/UniversityComparison';
import SearchAndFilters from '../components/ui/SearchAndFilters';
import { Pagination } from '../components/ui';
import { X, Maximize2, Minimize2, GitCompare } from 'lucide-react';

// Import JSON data directly
import universityData from '../data/usnewsTop100.json';

const UniversityExplorer = () => {
  const animateBackground = true;
  const { isLight } = useTheme();
  const [highlightGlow, setHighlightGlow] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterAcceptance, setFilterAcceptance] = useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filterMajor, setFilterMajor] = useState('');

  // Details panel state
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsFullScreen, setDetailsFullScreen] = useState(false);

  // Comparison state
  const [showComparison, setShowComparison] = useState(false);

  // Context hooks
  const { studentProfile } = useStudentProfile();
  const { compareList, removeFromCompare, addToCompare } = useFavorites();

  // Universities state
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [universitiesPerPage] = useState(12);

  // Load universities on mount and when student profile changes
  useEffect(() => {
    setLoading(true);
    try {
      const universitiesWithChances = universityData.universities.map(university => {
        const admissionChance = calculateAcceptanceChance(university, studentProfile);
        return {
          ...university,
          admissionChance
        };
      });
      setUniversities(universitiesWithChances);
    } catch (error) {
      console.error("Error loading university data:", error);
    } finally {
      setLoading(false);
    }
  }, [studentProfile]);

  // Show comparison when items are added
  useEffect(() => {
    setShowComparison(compareList.some(item => item !== null));
  }, [compareList]);

  // Apply filters and reset to page 1 when filters change
  useEffect(() => {
    let filtered = [...universities];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(term) ||
        uni.location.toLowerCase().includes(term)
      );
    }

    if (filterRegion !== 'All') {
      filtered = filtered.filter(uni => {
        const state = uni.location.split(', ')[1];
        const regionToStates = {
          'Northeast': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
          'Southeast': ['DE', 'MD', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'KY', 'TN', 'AL', 'MS', 'AR', 'LA'],
          'Midwest': ['OH', 'IN', 'MI', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
          'Southwest': ['TX', 'OK', 'NM', 'AZ'],
          'West': ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'UT', 'NV', 'CA', 'AK', 'HI']
        };
        return regionToStates[filterRegion]?.includes(state);
      });
    }

    if (filterType !== 'All') {
      filtered = filtered.filter(uni => uni.type === filterType);
    }

    if (filterAcceptance > 0) {
      const acceptanceRanges = [
        { min: 0, max: 100 },
        { min: 0, max: 5 },
        { min: 5, max: 15 },
        { min: 15, max: 30 },
        { min: 30, max: 100 }
      ];
      const range = acceptanceRanges[filterAcceptance];
      filtered = filtered.filter(uni =>
        uni.acceptanceRate >= range.min &&
        uni.acceptanceRate < range.max
      );
    }

    if (filterMajor) {
      filtered = filtered.filter(uni =>
        uni.topPrograms?.some(program =>
          program.toLowerCase().includes(filterMajor.toLowerCase())
        )
      );
    }

    filtered.sort((a, b) => b.admissionChance.score - a.admissionChance.score);
    setFilteredUniversities(filtered);
    setCurrentPage(1);
  }, [universities, searchTerm, filterRegion, filterType, filterAcceptance, filterMajor]);

  // Calculate current page universities
  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = filteredUniversities.slice(indexOfFirstUniversity, indexOfLastUniversity);

  // Change page handler with proper scrolling
  const handlePageChange = useCallback((pageNumber) => {
    const totalPages = Math.ceil(filteredUniversities.length / universitiesPerPage);
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    setCurrentPage(pageNumber);

    setTimeout(() => {
      const gridElement = document.querySelector('.universities-grid');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, [filteredUniversities.length, universitiesPerPage]);

  // Handle search
  const handleSearch = useCallback(() => {
    // Search is handled automatically by useEffect
  }, []);

  // Background animation effect
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setHighlightGlow(prev => !prev);
    }, 2000);
    return () => clearInterval(glowInterval);
  }, []);

  // Handle university selection
  const handleUniversitySelect = (university) => {
    setSelectedUniversity(university);
    if (window.innerWidth <= 768) {
      setDetailsFullScreen(true);
    }
  };

  // Calculate grid width based on details panel state
  const getGridWidth = () => {
    if (!selectedUniversity) return 'w-full';
    if (detailsFullScreen) return 'hidden';
    if (detailsExpanded) return 'w-1/2';
    return 'w-2/3';
  };

  // Calculate details width based on state
  const getDetailsWidth = () => {
    if (detailsFullScreen) return 'w-full';
    if (detailsExpanded) return 'w-1/2';
    return 'w-1/3';
  };

  return (
    <div className={`flex flex-col h-full relative overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
    }`}>
      {/* Background effects - fixed positioning to prevent scroll interference */}
      <div className="fixed inset-0 -z-10">
        <BackgroundEffects animateBackground={animateBackground} />
      </div>

      <StudentProfile />

      {/* Main content - properly scrollable */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{
          marginBottom: showComparison ? '400px' : '0',
          minHeight: 0
        }}
      >
        {/* University grid */}
        <div className={`${getGridWidth()} flex flex-col`}>
          <div className="flex-1 overflow-y-auto p-4 universities-grid">
            {/* Search and Results Header */}
            <div className="mb-6">
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterRegion={filterRegion}
                setFilterRegion={setFilterRegion}
                filterType={filterType}
                setFilterType={setFilterType}
                filterAcceptance={filterAcceptance}
                setFilterAcceptance={setFilterAcceptance}
                onSearch={handleSearch}
                showAdvancedSearch={showAdvancedSearch}
                setShowAdvancedSearch={setShowAdvancedSearch}
                filterMajor={filterMajor}
                setFilterMajor={setFilterMajor}
                totalResults={filteredUniversities.length}
                currentStart={indexOfFirstUniversity + 1}
                currentEnd={Math.min(indexOfLastUniversity, filteredUniversities.length)}
              />

              {/* Comparison toggle button */}
              {compareList.some(item => item !== null) && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                      isLight
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <GitCompare size={14} className="mr-2" />
                    Compare ({compareList.filter(item => item !== null).length})
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className={`text-lg ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                    Loading universities...
                  </p>
                </div>
              </div>
            ) : filteredUniversities.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-64 ${
                isLight ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <div className="text-lg mb-2">No matching universities found</div>
                <div className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  Try adjusting your filters
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUniversities.map(university => (
                    <EnhancedUniversityCard
                      key={university.id}
                      university={university}
                      isSelected={selectedUniversity?.id === university.id}
                      highlightGlow={highlightGlow}
                      onClick={() => handleUniversitySelect(university)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {filteredUniversities.length > universitiesPerPage && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(filteredUniversities.length / universitiesPerPage)}
                      onPageChange={handlePageChange}
                      totalItems={filteredUniversities.length}
                      itemsPerPage={universitiesPerPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* University details panel */}
        {selectedUniversity && (
          <div className={`${getDetailsWidth()} flex flex-col border-l transition-colors ${
            isLight ? 'border-gray-200' : 'border-gray-700'
          }`}>
            {/* Details controls bar */}
            <div className={`flex items-center justify-between p-3 border-b flex-shrink-0 ${
              isLight
                ? 'bg-gray-100 border-gray-200'
                : 'bg-gray-800 border-gray-700'
            }`}>
              <h3 className="text-lg font-semibold truncate">{selectedUniversity.name}</h3>
              <div className="flex items-center space-x-2">
                {/* Desktop responsive buttons */}
                <button
                  onClick={() => setDetailsExpanded(!detailsExpanded)}
                  className={`p-1 rounded transition-colors md:inline-block hidden ${
                    isLight
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title={detailsExpanded ? "Collapse panel" : "Expand panel"}
                >
                  {detailsExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Mobile responsive buttons */}
                <button
                  onClick={() => setDetailsFullScreen(!detailsFullScreen)}
                  className={`p-1 rounded transition-colors md:hidden ${
                    isLight
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title={detailsFullScreen ? "Exit full screen" : "Full screen"}
                >
                  {detailsFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                <button
                  onClick={() => setSelectedUniversity(null)}
                  className={`p-1 rounded transition-colors ${
                    isLight
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title="Close details"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <SimpleUniversityDetails
                university={selectedUniversity}
                onClose={() => setSelectedUniversity(null)}
              />
            </div>
          </div>
        )}
      </div>

      {/* University Comparison Panel */}
      {showComparison && (
        <UniversityComparison
          universities={compareList}
          onRemove={removeFromCompare}
          onAdd={() => {
            const emptyIndex = compareList.findIndex(item => item === null);
            if (emptyIndex !== -1) {
              console.log('Add suggestion at index:', emptyIndex);
            }
          }}
        />
      )}
    </div>
  );
};

export default UniversityExplorer;