import React from 'react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Maximum number of page buttons to show

    if (totalPages <= maxPageButtons) {
      // If total pages is small, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of current window
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust window if needed
      if (currentPage <= 2) {
        end = start + 2;
      } else if (currentPage >= totalPages - 1) {
        start = end - 2;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push('...');
      }

      // Add page numbers in the window
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col items-center my-4">
      <div className="text-xs text-gray-400 mb-2">
        Showing {Math.min(itemsPerPage, totalItems)} of {totalItems} results
        {totalPages > 1 && ` | Page ${currentPage} of ${totalPages}`}
      </div>

      <div className="flex space-x-1">
        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}
        >
          &laquo;
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => pageNum !== '...' ? onPageChange(pageNum) : null}
            disabled={pageNum === '...'}
            className={`px-3 py-1 rounded text-sm ${
              pageNum === currentPage
                ? 'bg-blue-500 text-white font-medium'
                : pageNum === '...'
                  ? 'bg-gray-700 text-gray-400 cursor-default'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;