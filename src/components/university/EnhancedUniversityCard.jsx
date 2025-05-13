// src/components/university/EnhancedUniversityCard.jsx - Improved with more details
import React from 'react';
import { Star, Users, MapPin, Trophy, DollarSign, BookOpen } from 'lucide-react';

const EnhancedUniversityCard = ({ university, isSelected, highlightGlow, onClick }) => {
  const admissionChance = university.admissionChance;
  const isHighChance = admissionChance.score >= 70;
  const isTarget = admissionChance.score >= 40 && admissionChance.score < 70;

  const prestigeStars = (level, small = false) => {
    return Array(3).fill(0).map((_, index) => (
      <Star
        key={index}
        size={small ? 12 : 16}
        className={`${index < level ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  const getPrestigeLevel = (rank) => {
    if (rank <= 10) return 3;
    if (rank <= 30) return 2;
    return 1;
  };

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 'N/A';
  };

  const getCardBackground = () => {
    if (isSelected) {
      return 'bg-gradient-to-br from-blue-700 to-blue-800 scale-105 shadow-lg shadow-blue-500/50 ring-2 ring-blue-400 z-10';
    } else if (admissionChance.score >= 80) {
      return 'bg-gradient-to-br from-green-900/60 to-green-800/60 hover:from-green-800 hover:to-green-700 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-green-500/30 border border-green-700';
    } else if (admissionChance.score >= 40) {
      return 'bg-gradient-to-br from-yellow-900/60 to-yellow-800/60 hover:from-yellow-800 hover:to-yellow-700 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-yellow-500/30 border border-yellow-700';
    } else {
      return 'bg-gradient-to-br from-red-900/40 to-red-800/40 hover:from-red-800/60 hover:to-red-700/60 hover:scale-105 hover:-translate-y-1 hover:shadow-md hover:shadow-red-500/30 border border-red-800/50';
    }
  };

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

  const getRank = () => {
    if (university.usnRank) return { type: 'USN', rank: university.usnRank };
    if (university.qsRank) return { type: 'QS', rank: university.qsRank };
    return { type: '', rank: 'N/A' };
  };

  const rankInfo = getRank();

  // Get top 2 programs for display
  const topPrograms = university.topPrograms?.slice(0, 2) || [];

  return (
    <div
      className={`cursor-pointer flex flex-col p-4 rounded-lg transition-all duration-300 transform hover:shadow-xl ${getCardBackground()}`}
      onClick={onClick}
    >
      {/* Header with ranking badge and basic info */}
      <div className="flex items-start mb-3">
        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center mr-3 overflow-hidden ${getRankBadgeStyle()}`}>
          <div className={`absolute inset-0 rounded-full ${getRankRingStyle()} transition-all duration-300`} />
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg">
            {rankInfo.rank}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base leading-tight mb-1">{university.name}</h3>
          <div className="flex items-center text-sm text-gray-300 mb-1">
            <MapPin size={12} className="mr-1" />
            <span className="mr-3">{university.location}</span>
            <span className="text-xs px-2 py-1 bg-gray-700/70 rounded-full">{university.type}</span>
          </div>
          <div className="flex items-center gap-1">
            {prestigeStars(getPrestigeLevel(rankInfo.rank), true)}
            <span className="text-xs text-gray-400 ml-1">Prestige</span>
          </div>
        </div>
      </div>

      {/* Key stats grid */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 mb-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Users size={12} className="mr-1 text-gray-400" />
            <span className="text-gray-400">Students:</span>
          </div>
          <span className="font-medium">{formatNumber(university.studentCount)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <DollarSign size={12} className="mr-1 text-gray-400" />
            <span className="text-gray-400">Tuition:</span>
          </div>
          <span className="font-medium">${formatNumber(university.tuitionInState)}/yr</span>
        </div>

        {university.demographics && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Gender:</span>
            <span className="font-medium">
              {Math.round(university.demographics.men * 100)}% M / {Math.round(university.demographics.women * 100)}% F
            </span>
          </div>
        )}
      </div>

      {/* Programs preview */}
      {topPrograms.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <BookOpen size={12} className="mr-1 text-gray-400" />
            <span className="text-xs text-gray-400">Top Programs:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {topPrograms.map((program, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-blue-900/30 rounded-full text-blue-200">
                {program}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* University stats */}
      <div className="mt-auto space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">{rankInfo.type} Rank:</span>
          <div className="flex items-center">
            <Trophy size={12} className="mr-1 text-yellow-500" />
            <span className="font-medium">#{rankInfo.rank}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Acceptance:</span>
          <span className="font-medium">{university.acceptanceRate}%</span>
        </div>

        {university.satRange && university.satRange.min > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">SAT Range:</span>
            <span className="font-medium">{university.satRange.min}-{university.satRange.max}</span>
          </div>
        )}

        {/* Admission chance badge */}
        <div className={`mt-3 text-center py-2 rounded-lg text-sm font-medium relative overflow-hidden ${
          admissionChance.score >= 80
            ? 'bg-gradient-to-r from-green-800/50 to-green-700/50 border border-green-700/50 shadow shadow-green-400/30'
            : admissionChance.score >= 40
              ? 'bg-gradient-to-r from-yellow-800/50 to-yellow-700/50 border border-yellow-700/50 shadow shadow-yellow-400/20'
              : 'bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-800/50'
        }`}>
          <div className="relative z-10">
            <div className={admissionChance.score >= 80 ? 'text-green-400' :
                           admissionChance.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
              {admissionChance.score >= 80 ? 'Safety School' :
               admissionChance.score >= 40 ? 'Target School' : 'Reach School'}
            </div>
            <div className="text-xs opacity-90 mt-1">
              {admissionChance.score}% chance
            </div>
          </div>
          {isSelected && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedUniversityCard;