// src/components/university/SimpleUniversityDetails.jsx - Light theme support
import React from 'react';
import { Heart, GitCompare, ExternalLink, Trophy, Users, DollarSign, TrendingUp, MapPin, GraduationCap } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../context/ThemeContext';

const SimpleUniversityDetails = ({ university, onClose, showFull = false }) => {
  const { isLight } = useTheme();
  const {
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    isInCompare,
    addToCompare
  } = useFavorites();

  if (!university) return null;

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 'N/A';
  };

  const handleToggleFavorites = () => {
    if (isFavorite(university.id)) {
      removeFromFavorites(university.id);
    } else {
      addToFavorites(university);
    }
  };

  const handleAddToCompare = () => {
    if (!isInCompare(university.id)) {
      addToCompare(university);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isLight ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'}`}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">

          {/* Overview Section */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center ${
              isLight ? 'text-blue-600' : 'text-blue-300'
            }`}>
              <TrendingUp size={20} className="mr-2" />
              Overview
            </h2>

            <p className={`leading-relaxed mb-4 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              {university.description || `${university.name} is a ${university.type.toLowerCase()} university located in ${university.location}.`}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <GraduationCap size={14} className="mr-1" />
                  Type
                </div>
                <div className="font-semibold text-lg">{university.type}</div>
              </div>

              <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <Users size={14} className="mr-1" />
                  Total Students
                </div>
                <div className="font-semibold text-lg">{formatNumber(university.studentCount)}</div>
              </div>
            </div>

            {/* Website link */}
            {university.website && (
              <div className="mb-4">
                <a
                  href={`https://${university.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center hover:underline ${
                    isLight ? 'text-blue-600 hover:text-blue-500' : 'text-blue-400 hover:text-blue-300'
                  }`}
                >
                  <ExternalLink size={16} className="mr-2" />
                  Visit {university.name} website
                </a>
              </div>
            )}

            {/* Top programs preview */}
            {university.topPrograms && university.topPrograms.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Popular Programs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {university.topPrograms.slice(0, 6).map((program, index) => (
                    <span key={index} className={`px-3 py-1.5 rounded-full text-sm border ${
                      isLight
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-blue-900/30 border-blue-800/30 text-blue-200'
                    }`}>
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admission Info Section */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center ${
              isLight ? 'text-blue-600' : 'text-blue-300'
            }`}>
              <TrendingUp size={20} className="mr-2" />
              Admission Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <TrendingUp size={14} className="mr-1" />
                  Acceptance Rate
                </div>
                <div className="font-semibold text-lg">{university.acceptanceRate}%</div>
                <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {university.acceptanceRate < 10 ? 'Highly Selective' :
                   university.acceptanceRate < 25 ? 'Very Selective' :
                   university.acceptanceRate < 50 ? 'Moderately Selective' : 'Less Selective'}
                </div>
              </div>

              {university.satRange && university.satRange.min > 0 && (
                <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>SAT Range</div>
                  <div className="font-semibold text-lg">{university.satRange.min} - {university.satRange.max}</div>
                  <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>25th - 75th percentile</div>
                </div>
              )}

              <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Your Admission Chance</div>
                <div className={`font-bold text-xl ${
                  university.admissionChance.score >= 80 ? 'text-green-600' :
                  university.admissionChance.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {university.admissionChance.score}%
                </div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    university.admissionChance.score >= 80
                      ? isLight
                        ? 'bg-green-100 text-green-800'
                        : 'bg-green-900 text-green-300'
                      : university.admissionChance.score >= 40
                        ? isLight
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-yellow-900 text-yellow-300'
                        : isLight
                          ? 'bg-red-100 text-red-800'
                          : 'bg-red-900 text-red-300'
                  }`}>
                    {university.admissionChance.score >= 80 ? 'Safety School' :
                     university.admissionChance.score >= 40 ? 'Target School' : 'Reach School'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  <Trophy size={14} className="mr-1" />
                  Ranking
                </div>
                <div className="font-semibold text-lg">
                  #{university.usnRank || university.qsRank || 'N/A'}
                </div>
                <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                  {university.usnRank ? 'US News' : university.qsRank ? 'QS World' : ''}
                </div>
              </div>
            </div>

            {/* Admission chance breakdown */}
            {university.admissionChance.components && (
              <div className={`p-4 rounded mt-4 ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  Admission Chance Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(university.admissionChance.components).map(([key, value]) => {
                    if (value === 0) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span>{label}</span>
                        <span className={`font-medium ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {value > 0 ? '+' : ''}{value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Demographics Section */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center ${
              isLight ? 'text-blue-600' : 'text-blue-300'
            }`}>
              <Users size={20} className="mr-2" />
              Demographics
            </h2>

            {university.demographics ? (
              <div className="space-y-4">
                <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                    Gender Distribution
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Male</span>
                      <span className="font-semibold">{Math.round(university.demographics.men * 100)}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-gray-600'}`}>
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${university.demographics.men * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between">
                      <span>Female</span>
                      <span className="font-semibold">{Math.round(university.demographics.women * 100)}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${isLight ? 'bg-gray-200' : 'bg-gray-600'}`}>
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${university.demographics.women * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {university.demographics.raceEthnicity && (
                  <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                    <h4 className={`text-lg font-semibold mb-3 ${isLight ? 'text-blue-600' : 'text-blue-300'}`}>
                      Racial/Ethnic Diversity
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(university.demographics.raceEthnicity)
                        .sort(([,a], [,b]) => b - a)
                        .map(([race, percentage]) => (
                          <div key={race} className="flex justify-between">
                            <span className="capitalize text-sm">
                              {race.replace(/_/g, ' ')
                                  .replace('aian', 'American Indian/Native')
                                  .replace('nhpi', 'Native Hawaiian/Pacific Islander')
                                  .replace('non resident alien', 'International')}
                            </span>
                            <span className="font-semibold text-sm">{Math.round(percentage * 100)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`text-center py-8 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                <p>Demographics data not available for this university.</p>
              </div>
            )}
          </div>

          {/* Costs & Financial Aid Section */}
          <div>
            <h2 className={`text-xl font-bold mb-4 flex items-center ${
              isLight ? 'text-blue-600' : 'text-blue-300'
            }`}>
              <DollarSign size={20} className="mr-2" />
              Costs & Financial Aid
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    <DollarSign size={14} className="mr-1" />
                    In-State Tuition
                  </div>
                  <div className="font-semibold text-lg">${formatNumber(university.tuitionInState)}</div>
                  <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Per year</div>
                </div>

                <div className={`p-4 rounded ${isLight ? 'bg-gray-50' : 'bg-gray-700'}`}>
                  <div className={`text-sm flex items-center ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    <DollarSign size={14} className="mr-1" />
                    Out-of-State Tuition
                  </div>
                  <div className="font-semibold text-lg">${formatNumber(university.tuitionOutState)}</div>
                  <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>Per year</div>
                </div>
              </div>

              <div className={`p-4 rounded border ${
                isLight
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-blue-900/20 border-blue-800/30'
              }`}>
                <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-200'}`}>
                  💡 <strong>Tip:</strong> The displayed costs are sticker prices. Most students receive financial aid that reduces the actual cost.
                  Use the university's net price calculator for a more accurate estimate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action buttons at bottom */}
      <div className={`flex-shrink-0 border-t p-4 ${
        isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="flex gap-3">
          <button
            onClick={handleToggleFavorites}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              isFavorite(university.id)
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Heart size={18} className={`mr-2 ${isFavorite(university.id) ? 'fill-current' : ''}`} />
            {isFavorite(university.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>

          <button
            onClick={handleAddToCompare}
            disabled={isInCompare(university.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              isInCompare(university.id)
                ? isLight
                  ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                  : 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <GitCompare size={18} className="mr-2" />
            {isInCompare(university.id) ? 'Already Comparing' : 'Add to Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleUniversityDetails;