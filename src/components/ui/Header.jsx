// src/components/ui/Header.jsx - UPDATED
import React from 'react';
import { filterOptions as options } from '../../data/filterOptions'; // Renamed to avoid confusion

const Header = ({
  searchTerm,
  setSearchTerm,
  filterRegion,
  setFilterRegion,
  filterType,
  setFilterType,
  filterAcceptance,
  setFilterAcceptance
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 flex justify-between items-center shadow-lg relative z-10 backdrop-blur-sm">
      <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
      <h1 className="text-2xl font-bold relative">
        QS Top Universities Explorer
        <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
      </h1>
      <div className="flex space-x-4">
        <div className="group relative">
          <input
            type="text"
            placeholder="Search universities..."
            className="px-4 py-2 bg-gray-800 rounded text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute inset-0 rounded border-2 border-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </div>
        <div className="group relative">
          <select
            className="appearance-none px-4 py-2 bg-gray-800 rounded text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
          >
            {options.regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">▼</div>
          <span className="absolute inset-0 rounded border-2 border-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </div>
        <div className="group relative">
          <select
            className="appearance-none px-4 py-2 bg-gray-800 rounded text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {options.types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">▼</div>
          <span className="absolute inset-0 rounded border-2 border-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </div>
        <div className="group relative">
          <select
            className="appearance-none px-4 py-2 bg-gray-800 rounded text-white border-2 border-transparent focus:border-blue-500 focus:outline-none transition-all duration-300 pr-8 shadow-inner"
            value={filterAcceptance}
            onChange={(e) => setFilterAcceptance(Number(e.target.value))}
          >
            {options.acceptanceRates.map(rate => (
              <option key={rate.level} value={rate.level}>{rate.name}</option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-blue-400">▼</div>
          <span className="absolute inset-0 rounded border-2 border-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
        </div>
      </div>
    </div>
  );
};

export default Header;