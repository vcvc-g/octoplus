// src/components/university/UniversityComparison.jsx - New comparison component
import React from 'react';
import { X, Plus, Trophy, Users, DollarSign, TrendingUp } from 'lucide-react';

const UniversityComparison = ({ universities, onRemove, onAdd }) => {
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 'N/A';
  };

  const compareItem = (label, icon, getValue, format = (val) => val) => (
    <div className="border-b border-gray-700 p-3">
      <div className="flex items-center text-sm text-gray-400 mb-2">
        {icon}
        <span className="ml-2">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {universities.map((uni, index) => (
          <div key={uni?.id || index} className="text-center">
            {uni ? (
              <span className="font-medium">{format(getValue(uni))}</span>
            ) : (
              <button
                onClick={onAdd}
                className="w-full py-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                <Plus size={16} className="mx-auto" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (!universities.some(uni => uni)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-800 border-t border-gray-700 p-4 z-50 max-h-96 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Compare Universities</h3>
          <button
            onClick={() => universities.forEach((_, index) => onRemove(index))}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {/* University headers */}
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-700">
            {universities.map((uni, index) => (
              <div key={uni?.id || index} className="text-center">
                {uni ? (
                  <div className="relative">
                    <button
                      onClick={() => onRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700 transition-colors"
                    >
                      <X size={12} />
                    </button>
                    <h4 className="font-semibold">{uni.name}</h4>
                    <p className="text-sm text-gray-400">{uni.location}</p>
                  </div>
                ) : (
                  <div className="h-12 flex items-center justify-center">
                    <span className="text-gray-500">Empty Slot</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison metrics */}
          {compareItem(
            'Ranking',
            <Trophy size={16} />,
            (uni) => uni.usnRank || uni.qsRank,
            (val) => val ? `#${val}` : 'N/A'
          )}

          {compareItem(
            'Acceptance Rate',
            <TrendingUp size={16} />,
            (uni) => uni.acceptanceRate,
            (val) => val ? `${val}%` : 'N/A'
          )}

          {compareItem(
            'Your Admission Chance',
            <TrendingUp size={16} />,
            (uni) => uni.admissionChance?.score,
            (val) => val ? `${val}%` : 'N/A'
          )}

          {compareItem(
            'Student Count',
            <Users size={16} />,
            (uni) => uni.studentCount,
            formatNumber
          )}

          {compareItem(
            'In-State Tuition',
            <DollarSign size={16} />,
            (uni) => uni.tuitionInState,
            (val) => val ? `$${formatNumber(val)}` : 'N/A'
          )}

          {compareItem(
            'Out-of-State Tuition',
            <DollarSign size={16} />,
            (uni) => uni.tuitionOutState,
            (val) => val ? `$${formatNumber(val)}` : 'N/A'
          )}

          {compareItem(
            'SAT Range',
            <TrendingUp size={16} />,
            (uni) => uni.satRange,
            (val) => val && val.min > 0 ? `${val.min}-${val.max}` : 'N/A'
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversityComparison;