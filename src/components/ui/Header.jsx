// src/components/ui/Header.jsx - Correct Header component without UniversityCard/UniversityDetails imports
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { filterOptions } from '../../data/filterOptions';

const Header = ({
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
  setFilterMajor
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-lg relative z-10">
      <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>

      <div className="relative">
        <h1 className="text-2xl font-bold mb-4">
          University Explorer
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>

        {/* Main search bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/70"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <button
              onClick={onSearch}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Advanced search options */}
        {showAdvancedSearch && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {filterOptions.regions.map((region) => (
                    <option key={region} value={region} className="bg-gray-800">
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {filterOptions.types.map((type) => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Acceptance Rate</label>
                <select
                  value={filterAcceptance}
                  onChange={(e) => setFilterAcceptance(Number(e.target.value))}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {filterOptions.acceptanceRates.map((rate) => (
                    <option key={rate.level} value={rate.level} className="bg-gray-800">
                      {rate.name}
                    </option>
                  ))}
                </select>
              </div>

              {filterMajor !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Major</label>
                  <select
                    value={filterMajor}
                    onChange={(e) => setFilterMajor(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                  >
                    <option value="" className="bg-gray-800">All Majors</option>
                    {filterOptions.majors.map((major) => (
                      <option key={major} value={major} className="bg-gray-800">
                        {major}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;