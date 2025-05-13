// src/components/ui/Header.jsx - Enhanced Header with better search
import React, { useState } from 'react';
import { Search, Filter, X, MapPin, School, Users, DollarSign } from 'lucide-react';
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
  const [activeFilters, setActiveFilters] = useState([]);

  const handleFilterChange = (filterType, value, displayValue) => {
    if (value === 'All' || value === 0) {
      setActiveFilters(prev => prev.filter(f => f.type !== filterType));
    } else {
      setActiveFilters(prev => {
        const filtered = prev.filter(f => f.type !== filterType);
        return [...filtered, { type: filterType, value: displayValue, icon: getFilterIcon(filterType) }];
      });
    }
  };

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'region':
        return <MapPin size={12} />;
      case 'type':
        return <School size={12} />;
      case 'acceptance':
        return <Users size={12} />;
      case 'major':
        return <Users size={12} />;
      default:
        return <Filter size={12} />;
    }
  };

  const clearFilter = (filterType) => {
    switch (filterType) {
      case 'region':
        setFilterRegion('All');
        break;
      case 'type':
        setFilterType('All');
        break;
      case 'acceptance':
        setFilterAcceptance(0);
        break;
      case 'major':
        setFilterMajor('');
        break;
    }
    handleFilterChange(filterType, 'All', '');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterRegion('All');
    setFilterType('All');
    setFilterAcceptance(0);
    setFilterMajor('');
    setActiveFilters([]);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-lg relative z-10">
      <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          University Explorer
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>

        {/* Main search and filter row */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search input with enhanced styling */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-white/70 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                showAdvancedSearch
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <button
              onClick={onSearch}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors font-medium text-white"
            >
              Search
            </button>
          </div>
        </div>

        {/* Active filters display */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-300">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <div
                key={index}
                className="bg-blue-700/50 border border-blue-500/50 rounded-full px-3 py-1 flex items-center gap-2 group hover:bg-blue-600/50 transition-colors"
              >
                {filter.icon}
                <span className="text-sm">{filter.value}</span>
                <button
                  onClick={() => clearFilter(filter.type)}
                  className="text-blue-300 hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-300 hover:text-white underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Advanced search options */}
        {showAdvancedSearch && (
          <div className="mt-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  Region
                </label>
                <select
                  value={filterRegion}
                  onChange={(e) => {
                    setFilterRegion(e.target.value);
                    handleFilterChange('region', e.target.value, e.target.value);
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {filterOptions.regions.map((region) => (
                    <option key={region} value={region} className="bg-gray-800">
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                  <School size={14} />
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    handleFilterChange('type', e.target.value, e.target.value);
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {filterOptions.types.map((type) => (
                    <option key={type} value={type} className="bg-gray-800">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                  <Users size={14} />
                  Acceptance Rate
                </label>
                <select
                  value={filterAcceptance}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFilterAcceptance(value);
                    const option = filterOptions.acceptanceRates.find(rate => rate.level === value);
                    handleFilterChange('acceptance', value, option?.name);
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                    <Users size={14} />
                    Major
                  </label>
                  <select
                    value={filterMajor}
                    onChange={(e) => {
                      setFilterMajor(e.target.value);
                      handleFilterChange('major', e.target.value, e.target.value);
                    }}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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