// src/components/ui/SearchAndFilters.jsx - Search bar with results summary
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { filterOptions } from '../../data/filterOptions';

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
  return (
    <div className="space-y-4">
      {/* Search bar and results in same line */}
      <div className="flex items-center justify-between gap-4">
        {/* Results summary */}
        <div className="text-sm text-gray-400 flex-shrink-0">
          Showing <span className="font-semibold text-white">{currentStart}</span> to{' '}
          <span className="font-semibold text-white">{currentEnd}</span> of{' '}
          <span className="font-semibold text-white">{totalResults}</span> results
          <span className="ml-2 px-2 py-0.5 bg-blue-900/50 rounded-full text-xs">
            Sorted by your admission chances
          </span>
        </div>

        {/* Compact search bar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
              showAdvancedSearch
                ? 'bg-blue-600 text-white'
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
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {filterOptions.regions.map((region) => (
                  <option key={region} value={region} className="bg-gray-700">
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {filterOptions.types.map((type) => (
                  <option key={type} value={type} className="bg-gray-700">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Acceptance Rate</label>
              <select
                value={filterAcceptance}
                onChange={(e) => setFilterAcceptance(Number(e.target.value))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {filterOptions.acceptanceRates.map((rate) => (
                  <option key={rate.level} value={rate.level} className="bg-gray-700">
                    {rate.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Major</label>
              <select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="" className="bg-gray-700">All Majors</option>
                {filterOptions.majors.map((major) => (
                  <option key={major} value={major} className="bg-gray-700">
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