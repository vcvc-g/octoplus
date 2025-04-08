import React from 'react';
import { calculateAcceptanceChance } from '../../utils/admissionsCalculator';
import { getPrestigeLevel } from '../../utils/prestigeCalculator';
import { useStudentProfile } from '../../context/StudentProfileContext';

const UniversityCard = ({
  university,
  isSelected,
  highlightGlow,
  onClick
}) => {
  const { studentProfile } = useStudentProfile();
  const admissionChance = calculateAcceptanceChance(university, studentProfile);
  const isHighChance = admissionChance.score >= 70;
  const isTarget = admissionChance.score >= 40 && admissionChance.score < 70;

  const prestigeStars = (level) => {
    return Array(3).fill(0).map((_, index) => (
      <span
        key={index}
        className={`text-lg ${index < level ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        ★
      </span>
    ));
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
  };

  // Determine card background based on admission chances
  const getCardBackground = () => {
    if (isSelected) {
      return 'bg-blue-700 scale-105 shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 z-10';
    } else if (admissionChance.score >= 80) {
      return 'bg-green-900/60 hover:bg-green-800 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-green-500/30 border border-green-700';
    } else if (admissionChance.score >= 40) {
      return 'bg-yellow-900/60 hover:bg-yellow-800 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-yellow-500/30 border border-yellow-700';
    } else {
      return 'bg-red-900/40 hover:bg-red-800/40 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-red-500/30 border border-red-800/50';
    }
  };

  // Determine rank badge style
  const getRankBadgeStyle = () => {
    if (isSelected) {
      return 'before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-blue-500 before:opacity-20';
    } else if (isHighChance) {
      return 'before:absolute before:inset-0 before:rounded-full before:animate-ping before:bg-green-500 before:opacity-20';
    } else if (isTarget) {
      return 'before:absolute before:inset-0 before:rounded-full before:bg-yellow-500 before:opacity-10';
    } else {
      return '';
    }
  };

  // Determine rank ring style
  const getRankRingStyle = () => {
    if (isSelected) {
      return 'animate-pulse ring-2 ring-blue-400';
    } else if (isHighChance) {
      return 'animate-pulse ring-2 ring-green-400';
    } else if (isTarget) {
      return 'ring-2 ring-yellow-400/50';
    } else {
      return 'hover:ring-2 hover:ring-red-300/50';
    }
  };

  return (
    <div
      className={`cursor-pointer flex flex-col p-3 rounded transition-all duration-300 transform ${getCardBackground()}`}
      onClick={onClick}
    >
      <div className="flex items-start mb-2">
        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mr-3 overflow-hidden ${getRankBadgeStyle()}`}>
          <div className={`absolute inset-0 rounded-full ${getRankRingStyle()} transition-all duration-300`} />
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
            {university.qsRank}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight mb-1">{university.name}</h3>
          <div className="flex items-center text-xs text-gray-300">
            <span className="mr-2">{university.location}</span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded">{university.type}</span>
          </div>
        </div>
      </div>

      {/* New section: Student information */}
      {university.studentCount && (
        <div className="bg-gray-800/40 p-2 rounded mb-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Students:</span>
            <span className="font-medium">{formatNumber(university.studentCount)}</span>
          </div>

          {/* Show tuition if available */}
          {university.tuitionInState > 0 && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-400">Tuition:</span>
              <span className="font-medium">${formatNumber(university.tuitionInState)}/yr</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto text-xs">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">QS Rank:</span>
          <span className="font-medium">{university.qsRank}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">Acceptance:</span>
          <span className="font-medium">{university.acceptanceRate}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Prestige:</span>
          <span>{prestigeStars(getPrestigeLevel(university.qsRank))}</span>
        </div>

        {/* SAT Range if available */}
        {university.satRange && university.satRange.min > 0 && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400">SAT Range:</span>
            <span className="font-medium">{university.satRange.min}-{university.satRange.max}</span>
          </div>
        )}

        <div className={`mt-2 text-center py-1 rounded-full text-xs font-medium
          ${admissionChance.score >= 80
            ? 'bg-green-800/50 border border-green-700/50 shadow shadow-green-400/30'
            : admissionChance.score >= 40
              ? 'bg-yellow-800/50 border border-yellow-700/50 shadow shadow-yellow-400/20'
              : 'bg-red-900/50 border border-red-800/50'}`
        }>
          <span className={admissionChance.color}>{admissionChance.category} ({admissionChance.score}%)</span>
        </div>
      </div>
    </div>
  );
};

export default UniversityCard;