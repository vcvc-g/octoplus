// src/components/ui/SearchAndFilters.jsx - Refined light theme
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { filterOptions } from '../../data/filterOptions';
import { useTheme } from '../../context/ThemeContext';

const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  filterRegion,
  setFilterRegion,
  filterType,
  setFilterType,
  filterAcceptance,
  setFilterAcceptance,
  onSearch,
  showAdvancedSearch,
  setShowAdvancedSearch,
  filterMajor,
  setFilterMajor,
  totalResults,
  currentStart,
  currentEnd
}) => {
  const { isLight } = useTheme();

  return (
    <div className="space-y-4">
      {/* Search bar and results in same line */}
      <div className="flex items-center justify-between gap-4">
        {/* Results summary - Fixed for light theme visibility */}
        <div className={`text-sm flex-shrink-0 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
          Showing <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentStart}</span> to{' '}
          <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentEnd}</span> of{' '}
          <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalResults}</span> results
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
            isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-900/50 text-blue-300'
          }`}>
            Sorted by admission chances
          </span>
        </div>

        {/* Compact search bar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-64">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isLight ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                isLight
                  ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isLight ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-white'
                }`}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
              showAdvancedSearch
                ? isLight
                  ? 'bg-indigo-600 text-white'
                  : 'bg-blue-600 text-white'
                : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Advanced search options */}
      {showAdvancedSearch && (
        <div className={`p-4 rounded-lg border ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-gray-800 border-gray-700'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={`w-full p-2 border rounded text-sm focus:ring-2 focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                {filterOptions.regions.map((region) => (
                  <option key={region} value={region} className={isLight ? 'bg-white' : 'bg-gray-700'}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`w-full p-2 border rounded text-sm focus:ring-2 focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                {filterOptions.types.map((type) => (
                  <option key={type} value={type} className={isLight ? 'bg-white' : 'bg-gray-700'}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>Acceptance Rate</label>
              <select
                value={filterAcceptance}
                onChange={(e) => setFilterAcceptance(Number(e.target.value))}
                className={`w-full p-2 border rounded text-sm focus:ring-2 focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                {filterOptions.acceptanceRates.map((rate) => (
                  <option key={rate.level} value={rate.level} className={isLight ? 'bg-white' : 'bg-gray-700'}>
                    {rate.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                isLight ? 'text-gray-700' : 'text-gray-300'
              }`}>Major</label>
              <select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
                className={`w-full p-2 border rounded text-sm focus:ring-2 focus:outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                    : 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="" className={isLight ? 'bg-white' : 'bg-gray-700'}>All Majors</option>
                {filterOptions.majors.map((major) => (
                  <option key={major} value={major} className={isLight ? 'bg-white' : 'bg-gray-700'}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters;