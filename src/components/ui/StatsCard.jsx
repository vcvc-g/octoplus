import React from 'react';

const StatsCard = ({ label, value, valueColor = "" }) => {
  return (
    <div className="backdrop-blur-sm bg-gray-800/50 p-3 rounded border border-gray-700/50 shadow-inner">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
};

export default StatsCard;