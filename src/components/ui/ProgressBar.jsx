// src/components/ui/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ label, strength }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className={strength.color}>{strength.text}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${strength.background} ${strength.width}`}></div>
      </div>
    </div>
  );
};

export default ProgressBar;