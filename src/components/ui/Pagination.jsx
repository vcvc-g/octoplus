// src/components/ui/Pagination.jsx - Refined light theme
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const { isLight } = useTheme();

  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const startItem = Math.max(1, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const rangeWithDots = [];
    rangeWithDots.push(1);

    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);

    if (start > 2) {
      if (start > 3) rangeWithDots.push('...');
    }

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        rangeWithDots.push(i);
      }
    }

    if (end < totalPages - 1) {
      if (end < totalPages - 2) rangeWithDots.push('...');
    }

    if (totalPages > 1) rangeWithDots.push(totalPages);

    return [...new Set(rangeWithDots)];
  };

  const handleClick = (page, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4 relative z-10">
      {/* Results summary - Already fixed in SearchAndFilters */}

      {/* Pagination controls - Fixed colors */}
      <nav className="flex items-center space-x-2 relative z-20" style={{ pointerEvents: 'auto' }}>
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 ${
            currentPage === 1
              ? isLight
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isLight
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
          }`}
          type="button"
          style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto' }}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers - Fixed colors */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className={`px-3 py-2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={(e) => handleClick(pageNum, e)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 ${
                  isCurrentPage
                    ? isLight
                      ? 'bg-indigo-600 text-white scale-105 shadow-sm'
                      : 'bg-blue-600 text-white scale-105 shadow-sm'
                    : isLight
                      ? 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
                type="button"
                style={{ pointerEvents: 'auto' }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all transform hover:scale-105 ${
            currentPage === totalPages
              ? isLight
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : isLight
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm'
          }`}
          type="button"
          style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto' }}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </nav>

      {/* Quick page jump */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2 text-sm">
          <span className={isLight ? 'text-slate-600' : 'text-gray-400'}>Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (page >= 1 && page <= totalPages && page !== currentPage) {
                onPageChange(page);
              }
            }}
            className={`w-16 px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 ${
              isLight
                ? 'bg-white border-slate-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                : 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
            }`}
            style={{ pointerEvents: 'auto' }}
          />
          <span className={isLight ? 'text-slate-600' : 'text-gray-400'}>of {totalPages}</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;