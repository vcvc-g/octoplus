// src/components/university/EnhancedUniversityCard.jsx - Light theme support
import React from 'react';
import { Star, Users, MapPin, Trophy, DollarSign, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const EnhancedUniversityCard = ({ university, isSelected, highlightGlow, onClick }) => {
  const { isLight } = useTheme();
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
      return `scale-105 shadow-lg ring-2 z-10 ${
        isLight
          ? 'bg-indigo-50 ring-indigo-500 shadow-indigo-500/50'
          : 'bg-blue-700 ring-blue-400 shadow-blue-500/50'
      }`;
    } else if (admissionChance.score >= 80) {
      return `hover:scale-105 hover:-translate-y-1 hover:shadow-lg transition-all ${
        isLight
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 hover:shadow-emerald-500/30'
          : 'bg-green-900/60 hover:bg-green-800 border border-green-700 hover:shadow-green-500/30'
      }`;
    } else if (admissionChance.score >= 40) {
      return `hover:scale-105 hover:-translate-y-1 hover:shadow-lg transition-all ${
        isLight
          ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 hover:shadow-orange-500/30'
          : 'bg-yellow-900/60 hover:bg-yellow-800 border border-yellow-700 hover:shadow-yellow-500/30'
      }`;
    } else {
      return `hover:scale-105 hover:-translate-y-1 hover:shadow-lg transition-all ${
        isLight
          ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 hover:shadow-rose-500/30'
          : 'bg-red-900/40 hover:bg-red-800/60 border border-red-800/50 hover:shadow-red-500/30'
      }`;
    }
  };

  const getRank = () => {
    if (university.usnRank) return { type: 'USN', rank: university.usnRank };
    if (university.qsRank) return { type: 'QS', rank: university.qsRank };
    return { type: '', rank: 'N/A' };
  };

  const rankInfo = getRank();
  const topPrograms = university.topPrograms?.slice(0, 2) || [];

  return (
    <div
      className={`cursor-pointer flex flex-col p-4 rounded-lg duration-300 transform hover:shadow-xl ${
        isLight ? 'bg-white' : ''
      } ${getCardBackground()}`}
      onClick={onClick}
    >
      {/* Header with ranking badge and basic info */}
      <div className="flex items-start mb-3">
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center mr-3 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg rounded-full">
            {rankInfo.rank}
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-base leading-tight mb-1 ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>{university.name}</h3>
          <div className={`flex items-center text-sm mb-1 ${
            isLight ? 'text-gray-600' : 'text-gray-300'
          }`}>
            <MapPin size={12} className="mr-1" />
            <span className="mr-3">{university.location}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-700/70 text-gray-300'
            }`}>{university.type}</span>
          </div>
          <div className="flex items-center gap-1">
            {prestigeStars(getPrestigeLevel(rankInfo.rank), true)}
            <span className={`text-xs ml-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Prestige</span>
          </div>
        </div>
      </div>

      {/* Key stats grid */}
      <div className={`rounded-lg p-3 mb-3 space-y-2 ${
        isLight
          ? admissionChance.score >= 80
            ? 'bg-emerald-25'
            : admissionChance.score >= 40
              ? 'bg-orange-25'
              : 'bg-rose-25'
          : 'bg-gray-800/30 backdrop-blur-sm'
      }`}>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Users size={12} className={`mr-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Students:</span>
          </div>
          <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {formatNumber(university.studentCount)}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <DollarSign size={12} className={`mr-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Tuition:</span>
          </div>
          <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
            ${formatNumber(university.tuitionInState)}/yr
          </span>
        </div>

        {university.demographics && (
          <div className="flex justify-between items-center text-sm">
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Gender:</span>
            <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {Math.round(university.demographics.men * 100)}% M / {Math.round(university.demographics.women * 100)}% F
            </span>
          </div>
        )}
      </div>

      {/* Programs preview */}
      {topPrograms.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <BookOpen size={12} className={`mr-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Top Programs:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {topPrograms.map((program, index) => (
              <span key={index} className={`text-xs px-2 py-1 rounded-full ${
                isLight
                  ? admissionChance.score >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : admissionChance.score >= 40
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-rose-100 text-rose-700'
                  : 'bg-blue-900/30 text-blue-200'
              }`}>
                {program}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* University stats */}
      <div className="mt-auto space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>{rankInfo.type} Rank:</span>
          <div className="flex items-center">
            <Trophy size={12} className="mr-1 text-yellow-500" />
            <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>#{rankInfo.rank}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Acceptance:</span>
          <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {university.acceptanceRate}%
          </span>
        </div>

        {university.satRange && university.satRange.min > 0 && (
          <div className="flex justify-between items-center">
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>SAT Range:</span>
            <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {university.satRange.min}-{university.satRange.max}
            </span>
          </div>
        )}

        {/* Admission chance badge */}
        <div className={`mt-3 text-center py-3 rounded-lg text-sm font-bold relative overflow-hidden ${
          admissionChance.score >= 80
            ? isLight
              ? 'bg-emerald-200 text-emerald-900 border-2 border-emerald-300'
              : 'bg-gradient-to-r from-green-800/50 to-green-700/50 border border-green-700/50 shadow shadow-green-400/30'
            : admissionChance.score >= 40
              ? isLight
                ? 'bg-orange-200 text-orange-900 border-2 border-orange-300'
                : 'bg-gradient-to-r from-yellow-800/50 to-yellow-700/50 border border-yellow-700/50 shadow shadow-yellow-400/20'
              : isLight
                ? 'bg-rose-200 text-rose-900 border-2 border-rose-300'
                : 'bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-800/50'
        }`}>
          <div className="relative z-10">
            <div>
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