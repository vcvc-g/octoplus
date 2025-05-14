// src/components/ui/Pagination.jsx - Completely rewritten for reliability
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Don't render if there's only one page or no pages
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Calculate display info
  const startItem = Math.max(1, (currentPage - 1) * itemsPerPage + 1);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Calculate the start and end of the middle range
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) {
      rangeWithDots.push(1);
      if (start > 3) {
        rangeWithDots.push('...');
      }
    } else {
      rangeWithDots.push(1);
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        rangeWithDots.push(i);
      }
    }

    // Add last page
    if (end < totalPages - 1) {
      if (end < totalPages - 2) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates and sort
    return [...new Set(rangeWithDots)].sort((a, b) => {
      if (a === '...' && b === '...') return 0;
      if (a === '...') return typeof b === 'number' ? (b < currentPage ? -1 : 1) : 0;
      if (b === '...') return typeof a === 'number' ? (a < currentPage ? -1 : 1) : 0;
      return a - b;
    });
  };

  const handleClick = (page) => {
    if (page !== '...' && page !== currentPage && page >= 1 && page <= totalPages) {
      console.log('Pagination: handleClick called with page:', page);
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      console.log('Pagination: Previous clicked, going to page:', currentPage - 1);
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      console.log('Pagination: Next clicked, going to page:', currentPage + 1);
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Results summary */}
      <div className="text-sm text-gray-400">
        Showing <span className="font-semibold text-white">{startItem}</span> to{' '}
        <span className="font-semibold text-white">{endItem}</span> of{' '}
        <span className="font-semibold text-white">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrentPage = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handleClick(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCurrentPage
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isCurrentPage ? 'page' : undefined}
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
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
          aria-label="Go to next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </nav>

      {/* Quick page jump for large result sets */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value, 10);
              if (page >= 1 && page <= totalPages && page !== currentPage) {
                console.log('Pagination: Quick jump to page:', page);
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Jump to page number"
          />
          <span className="text-gray-400">of {totalPages}</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;