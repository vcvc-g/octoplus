import React, { useState, useEffect, useCallback } from 'react';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { calculateAcceptanceChance } from '../../utils/admissionsCalculator';
import { BackgroundEffects, Header, Pagination } from '../ui';
import UniversityCard from './UniversityCard';
import UniversityDetails from './UniversityDetails';

// Import data directly from JSON
import universityData from '../../data/usnewsTop100.json';

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

  // Use student profile context for admission calculations
  const { studentProfile } = useStudentProfile();

  // Universities state
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [universitiesPerPage] = useState(12);

  // Load universities on mount
  useEffect(() => {
    // Add calculated admission chances to each university
    const universitiesWithChances = universityData.universities.map(university => {
      const admissionChance = calculateAcceptanceChance(university, studentProfile);
      return {
        ...university,
        admissionChance
      };
    });

    setUniversities(universitiesWithChances);
    setLoading(false);
  }, [studentProfile]); // Recalculate when student profile changes

  // Apply filters
  useEffect(() => {
    let filtered = [...universities];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(term) ||
        uni.location.toLowerCase().includes(term)
      );
    }

    // Apply region filter
    if (filterRegion !== 'All') {
      // This is a simplified version - you might need to adjust based on your data
      filtered = filtered.filter(uni => {
        const state = uni.location.split(', ')[1];

        // Map regions to states (simplified)
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

    // Apply type filter
    if (filterType !== 'All') {
      filtered = filtered.filter(uni => uni.type === filterType);
    }

    // Apply acceptance rate filter
    if (filterAcceptance > 0) {
      const acceptanceRanges = [
        { min: 0, max: 100 },  // All
        { min: 0, max: 5 },    // Very Selective (<5%)
        { min: 5, max: 15 },   // Selective (5-15%)
        { min: 15, max: 30 },  // Moderate (15-30%)
        { min: 30, max: 100 }  // High (>30%)
      ];

      const range = acceptanceRanges[filterAcceptance];
      filtered = filtered.filter(uni =>
        uni.acceptanceRate >= range.min &&
        uni.acceptanceRate < range.max
      );
    }

    // Apply major filter (if available in topPrograms)
    if (filterMajor) {
      filtered = filtered.filter(uni =>
        uni.topPrograms?.some(program =>
          program.toLowerCase().includes(filterMajor.toLowerCase())
        )
      );
    }

    // Sort by admission chances (highest to lowest)
    filtered.sort((a, b) => b.admissionChance.score - a.admissionChance.score);

    setFilteredUniversities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [universities, searchTerm, filterRegion, filterType, filterAcceptance, filterMajor]);

  // Calculate current page universities
  const indexOfLastUniversity = currentPage * universitiesPerPage;
  const indexOfFirstUniversity = indexOfLastUniversity - universitiesPerPage;
  const currentUniversities = filteredUniversities.slice(indexOfFirstUniversity, indexOfLastUniversity);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

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

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <BackgroundEffects animateBackground={animateBackground} />

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
        onSearch={handleSearch}
        showAdvancedSearch={showAdvancedSearch}
        setShowAdvancedSearch={setShowAdvancedSearch}
        filterMajor={filterMajor}
        setFilterMajor={setFilterMajor}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* University grid with pagination */}
        <div className={`${selectedUniversity ? 'w-2/3' : 'w-full'} p-4 overflow-y-auto`}>
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
                  <UniversityCard
                    key={university.id}
                    university={university}
                    isSelected={selectedUniversity?.id === university.id}
                    highlightGlow={highlightGlow}
                    onClick={() => setSelectedUniversity(university)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {filteredUniversities.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredUniversities.length / universitiesPerPage)}
                  onPageChange={paginate}
                  totalItems={filteredUniversities.length}
                  itemsPerPage={universitiesPerPage}
                />
              )}
            </>
          )}
        </div>

        {/* University details (only shown when a university is selected) */}
        {selectedUniversity && (
          <div className="w-1/3 h-full">
            <UniversityDetails
              university={selectedUniversity}
              onClose={() => setSelectedUniversity(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityExplorer;