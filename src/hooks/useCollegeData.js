// src/hooks/useCollegeData.js - Modified to only use real data
import { useState, useEffect, useCallback } from 'react';
import collegeScorecardService from '../services/collegeScorecard';

/**
 * Hook to fetch university data from the College Scorecard API
 * with pagination support
 */
export const useCollegeData = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(false);

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

  // Paginate data if needed client-side
  const paginateData = useCallback((data, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    return data.slice(startIndex, startIndex + perPage);
  }, []);

  // Check API configuration on mount
  useEffect(() => {
    const checkApiConfig = async () => {
      const apiKey = process.env.REACT_APP_SCORECARD_API_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        setError('College Scorecard API key not configured. Please provide a valid API key in the .env file (REACT_APP_SCORECARD_API_KEY).');
        setApiConfigured(false);
        setLoading(false);
      } else {
        setApiConfigured(true);
      }
    };
    checkApiConfig();
  }, []);

  // Fetch universities from API with filtering options
  const fetchUniversities = useCallback(async (options = {}) => {
    if (!apiConfigured) {
      setError('API not configured. Please provide a valid API key.');
      setLoading(false);
      return;
    }

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
        } else if (newFilters.filterRegion === 'Northeast' ||
                   newFilters.filterRegion === 'Southeast' ||
                   newFilters.filterRegion === 'Midwest' ||
                   newFilters.filterRegion === 'Southwest' ||
                   newFilters.filterRegion === 'West') {
          // For US regions, filter API results by state
          const regionStateMap = {
            'Northeast': ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA'],
            'Southeast': ['DE', 'MD', 'VA', 'WV', 'KY', 'NC', 'SC', 'TN', 'GA', 'FL', 'AL', 'MS', 'AR', 'LA'],
            'Midwest': ['OH', 'IN', 'MI', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
            'Southwest': ['TX', 'OK', 'NM', 'AZ'],
            'West': ['CO', 'WY', 'MT', 'ID', 'WA', 'OR', 'UT', 'NV', 'CA', 'AK', 'HI']
          };

          if (regionStateMap[newFilters.filterRegion]) {
            apiOptions.state = regionStateMap[newFilters.filterRegion].join(',');
          }
        } else {
          // International regions are not supported by the College Scorecard API
          // Since we're only using real data, inform user about this limitation
          setError(`The College Scorecard API only provides data for US universities. Filtering by "${newFilters.filterRegion}" region is not supported.`);
          setUniversities([]);
          setLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await collegeScorecardService.getUniversities(apiOptions);

      // Update pagination metadata
      updatePaginationMeta(
        response.metadata.total,
        response.metadata.perPage,
        response.metadata.page + 1 // Convert 0-based to 1-based
      );

      // Sort API results by ranking
      const sortedResults = [...response.universities].sort((a, b) => a.qsRank - b.qsRank);
      setUniversities(sortedResults);

    } catch (err) {
      console.error('Error fetching university data:', err);
      setError('Failed to load university data from the College Scorecard API. Please try again later.');
      setUniversities([]);
    } finally {
      setLoading(false);
    }
  }, [apiConfigured, itemsPerPage, paginateData, updatePaginationMeta]);

  // Change page
  const goToPage = useCallback((page) => {
    fetchUniversities({
      ...activeFilters,
      page
    });
  }, [fetchUniversities, activeFilters]);

  // Fetch a single university by ID
  const fetchUniversityById = useCallback(async (id) => {
    if (!apiConfigured) {
      setError('API not configured. Please provide a valid API key.');
      return null;
    }

    try {
      const university = await collegeScorecardService.getUniversityById(id);
      return university;
    } catch (err) {
      console.error(`Error fetching university with ID ${id}:`, err);
      setError(`Failed to fetch detailed data for university ID ${id}.`);
      return null;
    }
  }, [apiConfigured]);

  // Initial data fetch on mount
  useEffect(() => {
    if (apiConfigured) {
      fetchUniversities();
    }
  }, [apiConfigured, fetchUniversities]);

  return {
    universities,
    loading,
    error,
    apiConfigured,
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