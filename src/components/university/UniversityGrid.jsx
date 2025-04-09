import React from 'react';
import UniversityCard from './UniversityCard';
import { Pagination } from '../ui';

const UniversityGrid = ({
  universities,
  selectedUniversity,
  onUniversityClick,
  highlightGlow,
  loading,
  pagination,
  onPageChange,
  error
}) => {
  return (
    <div className="w-2/3 p-4 overflow-y-auto flex flex-col">
      {/* Universities Grid */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-blue-300">Loading universities...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-lg mb-2 text-red-400">Error loading university data</div>
            <div className="text-sm text-gray-400 max-w-md">{error}</div>
            <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
              <p>To use real university data, please ensure you have:</p>
              <ol className="list-decimal list-inside mt-2 text-left">
                <li className="mb-1">Created a .env file in the project root</li>
                <li className="mb-1">Added your College Scorecard API key: REACT_APP_SCORECARD_API_KEY=your_key_here</li>
                <li>Restarted the application</li>
              </ol>
            </div>
          </div>
        ) : universities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-lg mb-2">No matching universities found</div>
            <div className="text-sm text-gray-500">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map(university => (
              <UniversityCard
                key={university.id}
                university={university}
                isSelected={selectedUniversity?.id === university.id}
                highlightGlow={highlightGlow}
                onClick={() => onUniversityClick(university)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && universities.length > 0 && pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}
    </div>
  );
};

export default UniversityGrid;