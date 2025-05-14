// src/components/university/SimpleUniversityDetails.jsx - Fixed buttons at bottom
import React from 'react';
import { Heart, GitCompare, ExternalLink, Trophy, Users, DollarSign, TrendingUp, MapPin, GraduationCap } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';

const SimpleUniversityDetails = ({ university, onClose, showFull = false }) => {
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
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">

          {/* Overview Section */}
          <div>
            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Overview
            </h2>

            <p className="text-gray-300 leading-relaxed mb-4">
              {university.description || `${university.name} is a ${university.type.toLowerCase()} university located in ${university.location}.`}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm flex items-center">
                  <GraduationCap size={14} className="mr-1" />
                  Type
                </div>
                <div className="font-semibold text-lg">{university.type}</div>
              </div>

              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm flex items-center">
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
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Visit {university.name} website
                </a>
              </div>
            )}

            {/* Top programs preview */}
            {university.topPrograms && university.topPrograms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Popular Programs</h4>
                <div className="flex flex-wrap gap-2">
                  {university.topPrograms.slice(0, 6).map((program, index) => (
                    <span key={index} className="px-3 py-1.5 bg-blue-900/30 rounded-full text-sm border border-blue-800/30">
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admission Info Section */}
          <div>
            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Admission Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  Acceptance Rate
                </div>
                <div className="font-semibold text-lg">{university.acceptanceRate}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  {university.acceptanceRate < 10 ? 'Highly Selective' :
                   university.acceptanceRate < 25 ? 'Very Selective' :
                   university.acceptanceRate < 50 ? 'Moderately Selective' : 'Less Selective'}
                </div>
              </div>

              {university.satRange && university.satRange.min > 0 && (
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm">SAT Range</div>
                  <div className="font-semibold text-lg">{university.satRange.min} - {university.satRange.max}</div>
                  <div className="text-xs text-gray-500 mt-1">25th - 75th percentile</div>
                </div>
              )}

              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Your Admission Chance</div>
                <div className={`font-bold text-xl ${
                  university.admissionChance.score >= 80 ? 'text-green-400' :
                  university.admissionChance.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {university.admissionChance.score}%
                </div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-1 rounded text-xs ${
                    university.admissionChance.score >= 80 ? 'bg-green-900 text-green-300' :
                    university.admissionChance.score >= 40 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {university.admissionChance.score >= 80 ? 'Safety School' :
                     university.admissionChance.score >= 40 ? 'Target School' : 'Reach School'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm flex items-center">
                  <Trophy size={14} className="mr-1" />
                  Ranking
                </div>
                <div className="font-semibold text-lg">
                  #{university.usnRank || university.qsRank || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {university.usnRank ? 'US News' : university.qsRank ? 'QS World' : ''}
                </div>
              </div>
            </div>

            {/* Admission chance breakdown */}
            {university.admissionChance.components && (
              <div className="bg-gray-700 p-4 rounded mt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Admission Chance Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(university.admissionChance.components).map(([key, value]) => {
                    if (value === 0) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between items-center text-sm">
                        <span>{label}</span>
                        <span className={`font-medium ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
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
            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <Users size={20} className="mr-2" />
              Demographics
            </h2>

            {university.demographics ? (
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-lg font-semibold mb-3 text-blue-300">Gender Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Male</span>
                      <span className="font-semibold">{Math.round(university.demographics.men * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${university.demographics.men * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between">
                      <span>Female</span>
                      <span className="font-semibold">{Math.round(university.demographics.women * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${university.demographics.women * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {university.demographics.raceEthnicity && (
                  <div className="bg-gray-700 p-4 rounded">
                    <h4 className="text-lg font-semibold mb-3 text-blue-300">Racial/Ethnic Diversity</h4>
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
              <div className="text-center py-8 text-gray-400">
                <p>Demographics data not available for this university.</p>
              </div>
            )}
          </div>

          {/* Costs & Financial Aid Section */}
          <div>
            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
              <DollarSign size={20} className="mr-2" />
              Costs & Financial Aid
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm flex items-center">
                    <DollarSign size={14} className="mr-1" />
                    In-State Tuition
                  </div>
                  <div className="font-semibold text-lg">${formatNumber(university.tuitionInState)}</div>
                  <div className="text-xs text-gray-500 mt-1">Per year</div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <div className="text-gray-400 text-sm flex items-center">
                    <DollarSign size={14} className="mr-1" />
                    Out-of-State Tuition
                  </div>
                  <div className="font-semibold text-lg">${formatNumber(university.tuitionOutState)}</div>
                  <div className="text-xs text-gray-500 mt-1">Per year</div>
                </div>
              </div>

              <div className="bg-blue-900/20 p-4 rounded border border-blue-800/30">
                <p className="text-sm text-blue-200">
                  💡 <strong>Tip:</strong> The displayed costs are sticker prices. Most students receive financial aid that reduces the actual cost.
                  Use the university's net price calculator for a more accurate estimate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action buttons at bottom */}
      <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 p-4">
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
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
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