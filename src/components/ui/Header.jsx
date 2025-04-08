// src/components/ui/Header.jsx - Enhanced with advanced search
import React, { useState } from 'react';
import { filterOptions as options } from '../../data/filterOptions';
import { Search, Sliders, X } from 'lucide-react';

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
  showAdvancedSearch = false,
  setShowAdvancedSearch
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [localRegion, setLocalRegion] = useState(filterRegion);
  const [localType, setLocalType] = useState(filterType);
  const [localAcceptance, setLocalAcceptance] = useState(filterAcceptance);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();

    // Apply all filters at once
    setSearchTerm(localSearchTerm);
    setFilterRegion(localRegion);
    setFilterType(localType);
    setFilterAcceptance(localAcceptance);

    if (onSearch) {
      onSearch();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setLocalSearchTerm('');
    setLocalRegion('All');
    setLocalType('All');
    setLocalAcceptance(0);

    // Apply cleared filters
    setSearchTerm('');
    setFilterRegion('All');
    setFilterType('All');
    setFilterAcceptance(0);

    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex flex-col justify-between shadow-lg relative z-10 backdrop-blur-sm">
      <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>

      {/* Top row with title and search */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold relative">
          QS Top Universities Explorer
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="group relative flex-1">
            <input
              type="text"
              placeholder="Search universities..."
              className="w-64 px-4 py-2 pl-10 bg-gray-800 rounded text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-inner"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <span className="absolute inset-0 rounded border-2 border-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          </form>

          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`p-2 rounded ${showAdvancedSearch ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-700 transition-colors`}
            title="Toggle advanced search"
          >
            <Sliders className="h-5 w-5" />
          </button>

          {(localSearchTerm || localRegion !== 'All' || localType !== 'All' || localAcceptance !== 0) && (
            <button
              onClick={clearFilters}
              className="p-2 rounded bg-red-800 hover:bg-red-700 transition-colors"
              title="Clear all filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced search filters */}
      {showAdvancedSearch && (
        <div className="mt-4 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="group relative">
            <label className="block text-xs text-gray-400 mb-1">Region</label>
            <select
              className="w-full appearance-none px-3 py-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
              value={localRegion}
              onChange={(e) => setLocalRegion(e.target.value)}
            >
              {options.regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <div className="absolute right-2 top-7 pointer-events-none text-blue-400">▼</div>
          </div>

          <div className="group relative">
            <label className="block text-xs text-gray-400 mb-1">University Type</label>
            <select
              className="w-full appearance-none px-3 py-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
              value={localType}
              onChange={(e) => setLocalType(e.target.value)}
            >
              {options.types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="absolute right-2 top-7 pointer-events-none text-blue-400">▼</div>
          </div>

          <div className="group relative">
            <label className="block text-xs text-gray-400 mb-1">Acceptance Rate</label>
            <select
              className="w-full appearance-none px-3 py-2 bg-gray-800 rounded text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
              value={localAcceptance}
              onChange={(e) => setLocalAcceptance(Number(e.target.value))}
            >
              {options.acceptanceRates.map(rate => (
                <option key={rate.level} value={rate.level}>{rate.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-7 pointer-events-none text-blue-400">▼</div>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition-colors shadow"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;