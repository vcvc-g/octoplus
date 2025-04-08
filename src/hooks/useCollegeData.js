// src/hooks/useCollegeData.js - Updated with pagination support
import { useState, useEffect, useCallback } from 'react';
import collegeScorecardService from '../services/collegeScorecard';
import { universities as staticUniversities } from '../data/universities';

/**
 * Hook to fetch university data from the College Scorecard API
 * with fallback to static data and pagination support
 */
export const useCollegeData = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAPIAccess, setHasAPIAccess] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Keep track of all filters
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    filterRegion: 'All',
    filterType: 'All',
    filterAcceptance: 0,
    page: 1
  });

  // Calculate pagination metadata
  const updatePaginationMeta = useCallback((total, perPage, page) => {
    setTotalItems(total);
    setItemsPerPage(perPage);
    setCurrentPage(page);
    setTotalPages(Math.ceil(total / perPage));
  }, []);

  // Filter local data (used for non-API mode or when mixing with API data)
  const filterLocalData = useCallback((universities, filters) => {
    return universities.filter(university => {
      // Text search filter
      const matchesSearch = !filters.searchTerm ||
        university.name.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Region filter
      const matchesRegion = filters.filterRegion === 'All' ||
        university.location === filters.filterRegion ||
        (filters.filterRegion === 'United States' && university.location.includes('United States'));

      // Type filter
      const matchesType = filters.filterType === 'All' ||
        university.type === filters.filterType;

      // Acceptance rate filter
      let matchesAcceptance = true;
      if (filters.filterAcceptance > 0) {
        const rate = university.acceptanceRate;
        switch (filters.filterAcceptance) {
          case 1: // Very Selective (<5%)
            matchesAcceptance = rate < 5;
            break;
          case 2: // Selective (5-15%)
            matchesAcceptance = rate >= 5 && rate < 15;
            break;
          case 3: // Moderate (15-30%)
            matchesAcceptance = rate >= 15 && rate < 30;
            break;
          case 4: // High (>30%)
            matchesAcceptance = rate >= 30;
            break;
          default:
            // Keep default acceptance value (true)
            break;
        }
      }

      return matchesSearch && matchesRegion && matchesType && matchesAcceptance;
    });
  }, []);

  // Paginate data
  const paginateData = useCallback((data, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    return data.slice(startIndex, startIndex + perPage);
  }, []);

  // Fetch universities from API with filtering options
  const fetchUniversities = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    const newFilters = {
      searchTerm: options.searchTerm || '',
      filterRegion: options.filterRegion || 'All',
      filterType: options.filterType || 'All',
      filterAcceptance: options.filterAcceptance || 0,
      page: options.page || 1
    };

    setActiveFilters(newFilters);
    setCurrentPage(newFilters.page);

    try {
      // Check if API key is configured
      const apiKey = process.env.REACT_APP_SCORECARD_API_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        console.warn('College Scorecard API key not configured, using static data');
        setHasAPIAccess(false);

        // Filter and paginate static data
        const filteredData = filterLocalData(staticUniversities, newFilters);

        // Sort by ranking
        const sortedData = [...filteredData].sort((a, b) => a.qsRank - b.qsRank);

        updatePaginationMeta(sortedData.length, itemsPerPage, newFilters.page);

        // Apply pagination
        const paginatedData = paginateData(sortedData, newFilters.page, itemsPerPage);
        setUniversities(paginatedData);
        setLoading(false);
        return;
      }

      // Convert filter options to API parameters
      const apiOptions = {
        name: newFilters.searchTerm,
        state: '',
        type: newFilters.filterType !== 'All' ? newFilters.filterType : '',
        minAcceptanceRate: 0,
        maxAcceptanceRate: 100,
        page: newFilters.page - 1, // API uses 0-based indexing
        perPage: itemsPerPage
      };

      // Handle acceptance rate filtering
      if (newFilters.filterAcceptance > 0) {
        switch (newFilters.filterAcceptance) {
          case 1: // Very Selective (<5%)
            apiOptions.maxAcceptanceRate = 5;
            break;
          case 2: // Selective (5-15%)
            apiOptions.minAcceptanceRate = 5;
            apiOptions.maxAcceptanceRate = 15;
            break;
          case 3: // Moderate (15-30%)
            apiOptions.minAcceptanceRate = 15;
            apiOptions.maxAcceptanceRate = 30;
            break;
          case 4: // High (>30%)
            apiOptions.minAcceptanceRate = 30;
            break;
          default:
            // No additional filtering needed for default case
            break;
        }
      }

      // Handle region filtering
      if (newFilters.filterRegion && newFilters.filterRegion !== 'All') {
        if (newFilters.filterRegion === 'United States') {
          // No additional filter needed, API only returns US universities
        } else if (newFilters.filterRegion === 'Europe' ||
                  newFilters.filterRegion === 'Asia' ||
                  newFilters.filterRegion === 'Australia' ||
                  newFilters.filterRegion === 'United Kingdom') {
          // API doesn't support non-US filtering, use static data with filtering
          const filteredByRegion = staticUniversities.filter(
            univ => univ.location === newFilters.filterRegion
          );

          // Apply other filters
          const fullyFiltered = filterLocalData(filteredByRegion, {
            ...newFilters,
            filterRegion: 'All' // Already filtered by region
          });

          // Sort by ranking
          const sortedData = [...fullyFiltered].sort((a, b) => a.qsRank - b.qsRank);

          updatePaginationMeta(sortedData.length, itemsPerPage, newFilters.page);
          const paginatedData = paginateData(sortedData, newFilters.page, itemsPerPage);

          setUniversities(paginatedData);
          setHasAPIAccess(true); // We still have API access, just not using it for this query
          setLoading(false);
          return;
        } else {
          // For specific US regions, filter API results by state
          const regionStateMap = {
            'Northeast': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
            'Southeast': ['DE', 'MD', 'VA', 'WV', 'KY', 'NC', 'SC', 'TN', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
            'Midwest': ['OH', 'IN', 'MI', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
            'Southwest': ['TX', 'OK', 'NM', 'AZ'],
            'West': ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'UT', 'NV', 'CA', 'AK', 'HI']
          };

          if (regionStateMap[newFilters.filterRegion]) {
            apiOptions.state = regionStateMap[newFilters.filterRegion][0]; // Just use first state as example
          }
        }
      }

      // Fetch from API
      const response = await collegeScorecardService.getUniversities(apiOptions);
      setHasAPIAccess(true);

      // Update pagination metadata
      updatePaginationMeta(
        response.metadata.total,
        response.metadata.perPage,
        response.metadata.page + 1 // Convert 0-based to 1-based
      );

      // Merge with international universities if needed
      if (newFilters.filterRegion === 'All') {
        // For "All" regions, add some international universities from static data
        // But only on the first page to avoid duplication
        if (newFilters.page === 1) {
          const internationalUnivs = staticUniversities.filter(
            univ => !univ.location.includes('United States')
          );

          // Take a few international universities (limited to avoid overwhelming US results)
          const sampleInternational = internationalUnivs.slice(0, 4);

          // Sort combined results by ranking
          const combinedResults = [...response.universities, ...sampleInternational];
          const sortedResults = combinedResults.sort((a, b) => a.qsRank - b.qsRank);

          setUniversities(sortedResults);
        } else {
          // Sort API results by ranking
          const sortedResults = [...response.universities].sort((a, b) => a.qsRank - b.qsRank);
          setUniversities(sortedResults);
        }
      } else {
        // Sort API results by ranking
        const sortedResults = [...response.universities].sort((a, b) => a.qsRank - b.qsRank);
        setUniversities(sortedResults);
      }

    } catch (err) {
      console.error('Error fetching university data:', err);
      setError('Failed to load university data. Falling back to static data.');
      setHasAPIAccess(false);

      // Filter static data as a fallback
      const filteredData = filterLocalData(staticUniversities, newFilters);

      // Sort by ranking
      const sortedData = [...filteredData].sort((a, b) => a.qsRank - b.qsRank);

      updatePaginationMeta(sortedData.length, itemsPerPage, newFilters.page);

      // Apply pagination
      const paginatedData = paginateData(sortedData, newFilters.page, itemsPerPage);
      setUniversities(paginatedData);
    } finally {
      setLoading(false);
    }
  }, [filterLocalData, paginateData, updatePaginationMeta, itemsPerPage]);

  // Change page
  const goToPage = useCallback((page) => {
    fetchUniversities({
      ...activeFilters,
      page
    });
  }, [fetchUniversities, activeFilters]);

  // Fetch a single university by ID
  const fetchUniversityById = useCallback(async (id) => {
    try {
      // Check if API is available
      if (!hasAPIAccess) {
        // Fall back to static data
        const university = staticUniversities.find(univ => univ.id === id);
        return university;
      }

      const university = await collegeScorecardService.getUniversityById(id);
      return university;
    } catch (err) {
      console.error(`Error fetching university with ID ${id}:`, err);

      // Fall back to static data
      const university = staticUniversities.find(univ => univ.id === id);
      return university;
    }
  }, [hasAPIAccess]);

  // Initial data fetch on mount
  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  return {
    universities,
    loading,
    error,
    hasAPIAccess,
    fetchUniversities,
    fetchUniversityById,
    pagination: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      goToPage
    }
  };
};