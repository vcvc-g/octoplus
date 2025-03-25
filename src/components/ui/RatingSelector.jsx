import React from 'react';

const RatingSelector = ({ label, value, onChange, description }) => {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((ratingValue) => (
          <button
            key={ratingValue}
            className={`w-8 h-8 rounded-full ${value >= ratingValue ? 'bg-blue-600' : 'bg-gray-700'} mx-0.5`}
            onClick={() => onChange(ratingValue)}
          >
            {ratingValue}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {description}
      </div>
    </div>
  );
};

export default RatingSelector;