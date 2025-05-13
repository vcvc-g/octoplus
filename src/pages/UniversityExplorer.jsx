// src/pages/UniversityExplorer.jsx - Updated with responsive details panel
import React, { useState, useEffect, useCallback } from 'react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { calculateAcceptanceChance } from '../utils/admissionsCalculator';
import { BackgroundEffects } from '../components/ui';
import { Header } from '../components/ui';
import { Pagination } from '../components/ui';
import { StudentProfile } from '../components/student';
import { EnhancedUniversityCard, SimpleUniversityDetails } from '../components/university';
import { X, Maximize2, Minimize2 } from 'lucide-react';

// Import JSON data directly
import universityData from '../data/usnewsTop100.json';

const UniversityExplorer = () => {
  const animateBackground = true;
  const [highlightGlow, setHighlightGlow] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterAcceptance, setFilterAcceptance] = useState(0);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filterMajor, setFilterMajor] = useState('');

  // New state for details panel
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [detailsFullScreen, setDetailsFullScreen] = useState(false);

  // Use student profile context for admission calculations
  const { studentProfile } = useStudentProfile();

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

  // Apply filters (same as before)
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

  // Change page
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search
  const handleSearch = useCallback(() => {
    // Already handled by useEffect
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
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      <BackgroundEffects animateBackground={animateBackground} />

      <Header
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
      />

      <StudentProfile />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* University grid */}
        <div className={`${getGridWidth()} p-4 overflow-y-auto`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg text-blue-300">Loading universities...</p>
              </div>
            </div>
          ) : filteredUniversities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-lg mb-2">No matching universities found</div>
              <div className="text-sm text-gray-500">Try adjusting your filters</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-400">
                  Showing {currentUniversities.length} of {filteredUniversities.length} results
                  <span className="ml-2 px-2 py-0.5 bg-blue-900/50 rounded-full text-xs">
                    Sorted by your admission chances
                  </span>
                </div>
              </div>

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

              {filteredUniversities.length > universitiesPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredUniversities.length / universitiesPerPage)}
                  onPageChange={handlePageChange}
                  totalItems={filteredUniversities.length}
                  itemsPerPage={universitiesPerPage}
                />
              )}
            </>
          )}
        </div>

        {/* University details panel with improved controls */}
        {selectedUniversity && (
          <div className={`${getDetailsWidth()} h-full relative border-l border-gray-700`}>
            <div className="absolute inset-0 overflow-hidden">
              {/* Details controls bar */}
              <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
                <h3 className="text-lg font-semibold truncate">{selectedUniversity.name}</h3>
                <div className="flex items-center space-x-2">
                  {/* Mobile responsive buttons */}
                  <button
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors md:inline-block hidden"
                    title={detailsExpanded ? "Collapse panel" : "Expand panel"}
                  >
                    {detailsExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  <button
                    onClick={() => setDetailsFullScreen(!detailsFullScreen)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors md:hidden"
                    title={detailsFullScreen ? "Exit full screen" : "Full screen"}
                  >
                    {detailsFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  <button
                    onClick={() => setSelectedUniversity(null)}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                    title="Close details"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="absolute inset-0 top-12 overflow-y-auto">
                <SimpleUniversityDetails
                  university={selectedUniversity}
                  onClose={() => setSelectedUniversity(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityExplorer;