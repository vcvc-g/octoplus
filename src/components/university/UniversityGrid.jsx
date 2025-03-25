import React from 'react';
import UniversityCard from './UniversityCard';

const UniversityGrid = ({
  universities,
  selectedUniversity,
  onUniversityClick,
  highlightGlow
}) => {
  return (
    <div className="w-2/3 p-4 overflow-y-auto">
      <div className="grid grid-cols-3 gap-4">
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

      {universities.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-lg mb-2">No matching universities found</div>
          <div className="text-sm text-gray-500">Try adjusting your filters</div>
        </div>
      )}
    </div>
  );
};

export default UniversityGrid;