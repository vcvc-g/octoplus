// src/components/university/UniversityDetails.jsx - Enhanced with demographic data display
import React, { useState } from 'react';
import { ProgressBar, StatsCard } from '../ui';
import { useStudentProfile } from '../../context/StudentProfileContext';
import {
  getColorForScore,
  getBackgroundForScore
} from '../../utils/admissionsCalculator';
import { getPrestigeLevel } from '../../utils/prestigeCalculator';
import { ChevronLeft, User, Book, DollarSign, BarChart, Award, X } from 'lucide-react';

const UniversityDetails = ({ university, onClose }) => {
  const { studentProfile } = useStudentProfile();
  const [activeTab, setActiveTab] = useState('overview');

  // If no university is selected, show empty state
  if (!university) {
    return <EmptyUniversityDetails />;
  }

  // Determine rank type
  const rankType = university.usnRank ? 'USN' : 'QS';
  const rankValue = university.usnRank || university.qsRank || 'N/A';

  // Use the precalculated admission chance
  const admissionChance = university.admissionChance;

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Generate prestige stars
  const prestigeStars = (level, animate = false) => {
    return Array(3).fill(0).map((_, index) => (
      <span
        key={index}
        className={`text-lg transition-all duration-300
          ${index < level
            ? `text-yellow-400 ${animate ? 'hover:text-yellow-300 hover:animate-pulse hover:scale-110' : ''}`
            : `text-gray-400 ${animate ? 'hover:text-gray-300' : ''}`}`
        }
      >
        ★
      </span>
    ));
  };

  // Get race/ethnicity percentage
  const getEthnicityPercentage = (key) => {
    if (!university.demographics?.raceEthnicity) return 'N/A';
    const value = university.demographics.raceEthnicity[key];
    return value !== undefined ? `${Math.round(value * 100)}%` : 'N/A';
  };

  // Format ethnicity labels
  const formatEthnicityLabel = (key) => {
    const labels = {
      white: 'White',
      black: 'Black',
      hispanic: 'Hispanic/Latino',
      asian: 'Asian',
      aian: 'American Indian',
      nhpi: 'Pacific Islander',
      two_or_more: 'Two or More Races',
      non_resident_alien: 'International',
      unknown: 'Unknown'
    };
    return labels[key] || key;
  };

  // Tab content for Demographics
  const renderDemographicsTab = () => {
    if (!university.demographics) {
      return (
        <div className="text-center py-10 text-gray-400">
          No demographic data available for this university.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Gender distribution */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Gender Distribution</h3>
          <div className="bg-gray-800 p-4 rounded">
            {university.demographics.men !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Male</span>
                  <span>{Math.round(university.demographics.men * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-blue-500"
                    style={{ width: `${university.demographics.men * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {university.demographics.women !== undefined && (
              <div>
                <div className="flex justify-between mb-1">
                  <span>Female</span>
                  <span>{Math.round(university.demographics.women * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-pink-500"
                    style={{ width: `${university.demographics.women * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Racial/Ethnic Distribution */}
        {university.demographics.raceEthnicity && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Racial/Ethnic Distribution</h3>
            <div className="bg-gray-800 p-4 rounded">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(university.demographics.raceEthnicity)
                  .filter(key => key !== 'unknown')
                  .sort((a, b) =>
                    university.demographics.raceEthnicity[b] - university.demographics.raceEthnicity[a]
                  )
                  .map(key => (
                    <div key={key} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span>{formatEthnicityLabel(key)}</span>
                        <span>{getEthnicityPercentage(key)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${university.demographics.raceEthnicity[key] * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tab content for Academics
  const renderAcademicsTab = () => {
    return (
      <div className="space-y-6">
        {/* Top Programs */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Top Programs</h3>
          {university.topPrograms && university.topPrograms.length > 0 ? (
            <div className="bg-gray-800 p-4 rounded">
              <div className="flex flex-wrap gap-2">
                {university.topPrograms.map((program, index) => (
                  <div key={index} className="px-3 py-1.5 bg-blue-900/30 rounded-full text-sm border border-blue-800/30 hover:bg-blue-800/50 transition-colors duration-300 cursor-default">
                    {program}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-4 rounded text-gray-400 text-center">
              No program information available.
            </div>
          )}
        </div>

        {/* SAT/Test Scores */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Test Score Ranges</h3>
          <div className="bg-gray-800 p-4 rounded">
            {university.satRange && university.satRange.min > 0 ? (
              <div>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>SAT Range</span>
                    <span>{university.satRange.min} - {university.satRange.max}</span>
                  </div>
                  <div className="relative w-full bg-gray-700 rounded-full h-3">
                    <div className="absolute top-0 left-0 h-3 rounded-l-full bg-blue-600"
                      style={{ width: `${Math.min(100, (university.satRange.min / 1600) * 100)}%` }}>
                    </div>
                    <div className="absolute top-0 right-0 h-3 rounded-r-full bg-purple-600"
                      style={{ width: `${Math.min(100, ((1600 - university.satRange.max) / 1600) * 100)}%` }}>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                  <span>800</span>
                  <span>1200</span>
                  <span>1600</span>
                </div>

                {studentProfile.sat > 0 && (
                  <div className="mt-4 p-2 bg-gray-700 rounded">
                    <div className="text-sm mb-1">Your SAT Score: <span className="font-bold">{studentProfile.sat}</span></div>
                    <div className="relative w-full bg-gray-600 rounded-full h-2">
                      <div className="absolute top-0 h-2 rounded-full bg-green-500"
                        style={{
                          left: `${Math.max(0, Math.min(100, (studentProfile.sat / 1600) * 100))}%`,
                          width: '4px'
                        }}>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      {studentProfile.sat >= university.satRange.min && studentProfile.sat <= university.satRange.max ? (
                        <span className="text-green-400">Your SAT score is within this university's typical range.</span>
                      ) : studentProfile.sat > university.satRange.max ? (
                        <span className="text-blue-400">Your SAT score is above this university's typical range.</span>
                      ) : (
                        <span className="text-yellow-400">Your SAT score is below this university's typical range.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                SAT score range not available for this university.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tab content for Costs
  const renderCostsTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Tuition & Fees</h3>
          <div className="bg-gray-800 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard
                label="In-State Tuition"
                value={university.tuitionInState ? `$${formatNumber(university.tuitionInState)}` : 'N/A'}
                valueColor="text-green-400"
              />
              <StatsCard
                label="Out-of-State Tuition"
                value={university.tuitionOutState ? `$${formatNumber(university.tuitionOutState)}` : 'N/A'}
                valueColor="text-blue-400"
              />
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p>Note: Actual costs may vary based on financial aid, scholarships, and other factors. Visit the university's website for the most current information.</p>
              {university.website && (
                <a
                  href={`https://${university.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-400 hover:underline"
                >
                  Visit {university.name} website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab content for Admissions
  const renderAdmissionsTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Admission Chances</h3>
          <div className="bg-gray-800 p-4 rounded">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg font-bold mr-2">
                  {admissionChance.category}
                </span>
                <span className={`text-2xl font-bold ${admissionChance.color}`}>
                  {admissionChance.score}%
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">Confidence Range</span>
                <span className="text-sm">
                  {Math.max(5, admissionChance.score - 15)}% - {Math.min(95, admissionChance.score + 15)}%
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {/* Components from admission calculator */}
              {Object.entries(admissionChance.components || {}).map(([key, value]) => {
                // Skip components with 0 value
                if (value === 0) return null;

                // Format component name
                const componentNames = {
                  academic: "Academic Factors",
                  rigor: "Course Rigor",
                  applicationStrength: "Application Strength",
                  demographic: "Demographic Factors",
                  majorFit: "Major Fit",
                  earlyDecision: "Early Decision Advantage",
                  yieldProtection: "Yield Protection"
                };

                const name = componentNames[key] || key;

                return (
                  <ProgressBar
                    key={key}
                    label={name}
                    strength={{
                      text: `${value > 0 ? '+' : ''}${value}%`,
                      color: getColorForScore(value > 0 ? 70 : 30),
                      width: `w-[${Math.abs(value)}%]`,
                      background: getBackgroundForScore(value > 0 ? 70 : 30)
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Acceptance Rate</h3>
          <div className="bg-gray-800 p-4 rounded">
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Acceptance Rate</span>
                <span className="font-bold">{university.acceptanceRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    university.acceptanceRate < 10 ? 'bg-red-500' :
                    university.acceptanceRate < 20 ? 'bg-orange-500' :
                    university.acceptanceRate < 40 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, university.acceptanceRate * 2)}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              {university.acceptanceRate < 10 ? (
                <p>This is a highly selective university, admitting fewer than 1 in 10 applicants.</p>
              ) : university.acceptanceRate < 20 ? (
                <p>This is a very selective university, admitting fewer than 1 in 5 applicants.</p>
              ) : university.acceptanceRate < 40 ? (
                <p>This university is moderately selective, accepting fewer than half of all applicants.</p>
              ) : (
                <p>This university accepts a higher percentage of applicants compared to more selective institutions.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tab content for Overview
  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-300">Overview</h3>
          <p className="text-gray-300 bg-gray-800/50 p-3 rounded border border-gray-700/50 shadow-inner text-sm">
            {university.description || `${university.name} is a ${university.type.toLowerCase()} university located in ${university.location}.`}
          </p>
        </div>

        {/* Key Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-300">Key Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard label={`${rankType} Rank`} value={rankValue} />
            <StatsCard label="Acceptance Rate" value={`${university.acceptanceRate}%`} />
            <StatsCard label="Total Students" value={formatNumber(university.studentCount)} />
            <StatsCard label="Prestige" value={prestigeStars(getPrestigeLevel(rankValue))} />
          </div>
        </div>

        {/* Admission Chance Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-300">Your Admission Chance</h3>
          <div className="bg-gray-800 p-4 rounded shadow-inner border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xl font-bold ${admissionChance.color}`}>{admissionChance.category}</span>
                <span className="text-sm ml-2">({admissionChance.score}%)</span>
              </div>
              <button
                onClick={() => setActiveTab('admissions')}
                className="text-sm text-blue-400 hover:underline"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Get content based on active tab
  const getTabContent = () => {
    switch (activeTab) {
      case 'demographics':
        return renderDemographicsTab();
      case 'academics':
        return renderAcademicsTab();
      case 'costs':
        return renderCostsTab();
      case 'admissions':
        return renderAdmissionsTab();
      case 'overview':
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="bg-gray-900 h-full flex flex-col overflow-hidden">
      {/* University header with close button */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-lg relative z-10">
        <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold truncate pr-2">{university.name}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Close details"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="text-sm text-gray-300 mt-1">{university.location}</div>
      </div>

      {/* Tab navigation */}
      <div className="bg-gray-800 shadow-md px-1">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'demographics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('demographics')}
          >
            Demographics
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'academics' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('academics')}
          >
            Academics
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'costs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('costs')}
          >
            Costs
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'admissions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('admissions')}
          >
            Admissions
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {getTabContent()}
      </div>

      {/* Action button */}
      <div className="p-4 border-t border-gray-800">
        <button
          className={`w-full py-3 rounded font-bold relative overflow-hidden group transition-all duration-300
            ${admissionChance.score >= 70
              ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/40'
              : 'bg-blue-600 hover:bg-blue-500'}
          `}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">ADD TO FAVORITES</span>
        </button>
      </div>
    </div>
  );
};

// Placeholder component when no university is selected
const EmptyUniversityDetails = () => (
  <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center p-6 text-center text-gray-400">
    <div className="w-16 h-16 rounded-full bg-gray-700 mb-4 relative">
      <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      <div className="absolute -inset-1 rounded-full blur opacity-20 bg-blue-500 animate-ping"></div>
    </div>
    <h3 className="text-xl font-medium mb-2">Select a University</h3>
    <p className="max-w-xs text-gray-500">Click on a university card from the list to view detailed information about programs and requirements.</p>
    <div className="mt-6 animate-bounce">
      <ChevronLeft className="w-6 h-6 text-blue-400" />
    </div>
  </div>
);

export default UniversityDetails;