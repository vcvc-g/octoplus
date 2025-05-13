// src/pages/EnhancedUniversityExplorer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { calculateAcceptanceChance } from '../utils/admissionsCalculator';
import { BackgroundEffects } from '../components/ui';
import { Header } from '../components/ui';
import { Pagination } from '../components/ui';
import { StudentProfile } from '../components/student';

// Import JSON data directly
// Make sure this path is correct relative to your src directory
import universityData from '../data/usnewsTop100.json';

// Import or create the necessary components
const EnhancedUniversityCard = ({ university, isSelected, highlightGlow, onClick }) => {
  // Use the precalculated admission chance
  const admissionChance = university.admissionChance;
  const isHighChance = admissionChance.score >= 70;
  const isTarget = admissionChance.score >= 40 && admissionChance.score < 70;

  const prestigeStars = (level) => {
    return Array(3).fill(0).map((_, index) => (
      <span
        key={index}
        className={`text-lg ${index < level ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        ★
      </span>
    ));
  };

  // Get prestige level
  const getPrestigeLevel = (rank) => {
    if (rank <= 10) return 3;
    if (rank <= 30) return 2;
    return 1;
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
  };

  // Determine card background based on admission chances
  const getCardBackground = () => {
    if (isSelected) {
      return 'bg-blue-700 scale-105 shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 z-10';
    } else if (admissionChance.score >= 80) {
      return 'bg-green-900/60 hover:bg-green-800 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-green-500/30 border border-green-700';
    } else if (admissionChance.score >= 40) {
      return 'bg-yellow-900/60 hover:bg-yellow-800 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-yellow-500/30 border border-yellow-700';
    } else {
      return 'bg-red-900/40 hover:bg-red-800/40 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-red-500/30 border border-red-800/50';
    }
  };

  // Determine rank badge style
  const getRankBadgeStyle = () => {
    if (isSelected) {
      return 'before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-blue-500 before:opacity-20';
    } else if (isHighChance) {
      return 'before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-green-500 before:opacity-20';
    } else if (isTarget) {
      return 'before:absolute before:inset-0 before:rounded-full before:bg-yellow-500 before:opacity-10';
    } else {
      return '';
    }
  };

  // Determine rank ring style
  const getRankRingStyle = () => {
    if (isSelected) {
      return 'animate-pulse ring-2 ring-blue-400';
    } else if (isHighChance) {
      return 'animate-pulse ring-2 ring-green-400';
    } else if (isTarget) {
      return 'ring-2 ring-yellow-400/50';
    } else {
      return 'hover:ring-2 hover:ring-red-300/50';
    }
  };

  // Get ranking type (USN or QS)
  const getRank = () => {
    if (university.usnRank) return { type: 'USN', rank: university.usnRank };
    if (university.qsRank) return { type: 'QS', rank: university.qsRank };
    return { type: '', rank: 'N/A' };
  };

  const rankInfo = getRank();

  return (
    <div
      className={`cursor-pointer flex flex-col p-3 rounded transition-all duration-300 transform ${getCardBackground()}`}
      onClick={onClick}
    >
      <div className="flex items-start mb-2">
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mr-3 overflow-hidden ${getRankBadgeStyle()}`}>
          <div className={`absolute inset-0 rounded-full ${getRankRingStyle()} transition-all duration-300`} />
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
            {rankInfo.rank}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight mb-1">{university.name}</h3>
          <div className="flex items-center text-xs text-gray-300">
            <span className="mr-2">{university.location}</span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">{university.type}</span>
          </div>
        </div>
      </div>

      {/* Student information */}
      <div className="bg-gray-800/40 p-2 rounded mb-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Students:</span>
          <span className="font-medium">{formatNumber(university.studentCount)}</span>
        </div>

        {/* Show tuition if available */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400">Tuition:</span>
          <span className="font-medium">${formatNumber(university.tuitionInState)}/yr</span>
        </div>

        {/* Show demographic highlights if available */}
        {university.demographics && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400">Gender Ratio:</span>
            <span className="font-medium">
              {university.demographics.men
                ? `${Math.round(university.demographics.men * 100)}% M / ${Math.round(university.demographics.women * 100)}% F`
                : 'N/A'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto text-xs">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">{rankInfo.type} Rank:</span>
          <span className="font-medium">{rankInfo.rank}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">Acceptance:</span>
          <span className="font-medium">{university.acceptanceRate}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Prestige:</span>
          <span>{prestigeStars(getPrestigeLevel(rankInfo.rank))}</span>
        </div>

        {/* SAT Range if available */}
        {university.satRange && university.satRange.min > 0 && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400">SAT Range:</span>
            <span className="font-medium">{university.satRange.min}-{university.satRange.max}</span>
          </div>
        )}

        <div className={`mt-2 text-center py-1 rounded-full text-xs font-medium
          ${admissionChance.score >= 80
            ? 'bg-green-800/50 border border-green-700/50 shadow shadow-green-400/30'
            : admissionChance.score >= 40
              ? 'bg-yellow-800/50 border border-yellow-700/50 shadow shadow-yellow-400/20'
              : 'bg-red-900/50 border border-red-800/50'}`
        }>
          <span className={admissionChance.score >= 80 ? 'text-green-400' :
                          admissionChance.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
            {admissionChance.score >= 80 ? 'Safety' :
             admissionChance.score >= 40 ? 'Target' : 'Reach'} ({admissionChance.score}%)
          </span>
        </div>
      </div>
    </div>
  );
};

// Simple details component
const SimpleUniversityDetails = ({ university, onClose }) => {
  if (!university) return null;

  return (
    <div className="bg-gray-800 h-full flex flex-col overflow-auto p-4">
      <div className="border-b border-gray-700 pb-4 mb-4">
        <h2 className="text-xl font-bold">{university.name}</h2>
        <p className="text-gray-300">{university.location}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-300">Overview</h3>
        <p className="text-gray-300">{university.description}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-300">Admission Info</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-gray-400 text-sm">Acceptance Rate</div>
            <div className="font-semibold">{university.acceptanceRate}%</div>
          </div>

          {university.satRange && university.satRange.min > 0 && (
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-gray-400 text-sm">SAT Range</div>
              <div className="font-semibold">{university.satRange.min} - {university.satRange.max}</div>
            </div>
          )}

          <div className="bg-gray-700 p-3 rounded">
            <div className="text-gray-400 text-sm">Your Chance</div>
            <div className={university.admissionChance.score >= 80 ? 'text-green-400' :
                           university.admissionChance.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
              {university.admissionChance.score}%
            </div>
          </div>

          <div className="bg-gray-700 p-3 rounded">
            <div className="text-gray-400 text-sm">Tuition</div>
            <div className="font-semibold">${university.tuitionInState?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {university.demographics && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-300">Demographics</h3>
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between mb-2">
              <span>Male</span>
              <span>{Math.round(university.demographics.men * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Female</span>
              <span>{Math.round(university.demographics.women * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={onClose}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium"
        >
          Close Details
        </button>
      </div>
    </div>
  );
};

// Main enhanced university explorer component
const EnhancedUniversityExplorer = () => {
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

  // Load universities on mount and when student profile changes
  useEffect(() => {
    setLoading(true);
    try {
      // Add calculated admission chances to each university
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

      {/* Student Profile Component */}
      <StudentProfile />

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
                  <EnhancedUniversityCard
                    key={university.id}
                    university={university}
                    isSelected={selectedUniversity?.id === university.id}
                    highlightGlow={highlightGlow}
                    onClick={() => setSelectedUniversity(university)}
                  />
                ))}
              </div>

              {/* Pagination */}
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

        {/* University details (only shown when a university is selected) */}
        {selectedUniversity && (
          <div className="w-1/3 h-full">
            <SimpleUniversityDetails
              university={selectedUniversity}
              onClose={() => setSelectedUniversity(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedUniversityExplorer;