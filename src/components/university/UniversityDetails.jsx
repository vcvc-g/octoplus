import React from 'react';
import { ProgressBar, StatsCard } from '../ui';
import { useStudentProfile } from '../../context/StudentProfileContext';
import {
  calculateAcceptanceChance,
  getAcademicMatchStrength,
  getRatingStrength,
  getMajorCompetitiveness
} from '../../utils/admissionsCalculator';
import { getPrestigeLevel } from '../../utils/prestigeCalculator';

const UniversityDetails = ({ university }) => {
  // FIXED: Move hook call to top level - always call hooks unconditionally
  const { studentProfile, updateProfile } = useStudentProfile();

  // If no university is selected, show a placeholder
  if (!university) {
    return <EmptyUniversityDetails />;
  }

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

  const admissionChance = calculateAcceptanceChance(university, studentProfile);

  return (
    <div className="w-1/3 bg-gray-800 p-6 overflow-y-auto relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start mb-6 relative">
          <div className="w-20 h-20 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-800 flex items-center justify-center mr-4 overflow-hidden relative group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 mix-blend-overlay"></div>
            <div className="absolute inset-0 rounded-full animate-pulse ring-2 ring-blue-400/50"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <span className="text-2xl font-bold text-white relative z-10 group-hover:scale-105 transition-transform duration-300">
              {university.qsRank}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold relative inline-block truncate max-w-full">
              {university.name}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-900/50 rounded text-sm border border-blue-700/50 shadow-inner">{university.location}</span>
              <span className="px-2 py-0.5 bg-purple-900/50 rounded text-sm border border-purple-700/50 shadow-inner">{university.type}</span>
              <div className="group ml-2">{prestigeStars(getPrestigeLevel(university.qsRank), true)}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 relative">
          <h3 className="text-lg font-semibold mb-2 relative inline-block">
            Overview
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-400"></span>
          </h3>
          <p className="text-gray-300 backdrop-blur-sm bg-gray-800/50 p-3 rounded border border-gray-700/50 shadow-inner text-sm">
            {university.description}
          </p>
        </div>

        <div className="mb-6 relative">
          <h3 className="text-lg font-semibold mb-2 relative inline-block">
            Admissions Statistics
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-400"></span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatsCard label="Acceptance Rate" value={`${university.acceptanceRate}%`} />
            <StatsCard label="SAT Range" value={`${university.satRange.min}-${university.satRange.max}`} />
            <StatsCard label="GPA Cutoff" value={university.gpaCutoff} />
            <StatsCard
              label="Your Chance"
              value={`${admissionChance.score}%`}
              valueColor={admissionChance.color}
            />
          </div>
        </div>

        {/* Admission Chances Breakdown */}
        <div className="mb-6 relative">
          <h3 className="text-lg font-semibold mb-2 relative inline-block">
            Your Admission Chances
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-400"></span>
          </h3>
          <div className="backdrop-blur-sm bg-gray-800/50 p-4 rounded border border-gray-700/50 shadow-inner">
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
              {/* Academic Match */}
              <ProgressBar
                label="Academic Match"
                strength={getAcademicMatchStrength(studentProfile, university)}
              />

              {/* Show advanced metrics only if advanced profile is enabled */}
              {studentProfile.showAdvancedProfile && (
                <>
                  <ProgressBar
                    label="Course Rigor"
                    strength={getRatingStrength(studentProfile.courseRigor)}
                  />

                  <ProgressBar
                    label="Extracurriculars"
                    strength={getRatingStrength(studentProfile.extracurriculars)}
                  />

                  <ProgressBar
                    label="Essay Strength"
                    strength={getRatingStrength(studentProfile.essayStrength)}
                  />
                </>
              )}

              {/* Major competitiveness if a major is selected */}
              {studentProfile.intendedMajor && (
                <ProgressBar
                  label="Major Competitiveness"
                  strength={getMajorCompetitiveness(studentProfile.intendedMajor)}
                />
              )}

              {/* Early decision advantage */}
              {studentProfile.showAdvancedProfile && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Early Decision Advantage</span>
                    <span className={studentProfile.earlyDecision ? "text-green-400" : "text-gray-400"}>
                      {studentProfile.earlyDecision ? "Yes (+10%)" : "No"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${
                      studentProfile.earlyDecision ? "bg-green-500 w-4/5" : "bg-gray-600 w-0"
                    }`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Show link to enable advanced profile if not already enabled */}
            {!studentProfile.showAdvancedProfile && (
              <div className="mt-4 text-xs text-center">
                <button
                  onClick={() => updateProfile('showAdvancedProfile', true)}
                  className="text-blue-400 hover:underline"
                >
                  Show detailed breakdown (enable Advanced Profile)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 relative">
          <h3 className="text-lg font-semibold mb-2 relative inline-block">
            Top Programs
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-400"></span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {university.topPrograms.map((program, index) => (
              <div key={index} className="px-3 py-1.5 bg-blue-900/30 rounded-full text-sm border border-blue-800/30 hover:bg-blue-800/50 transition-colors duration-300 cursor-default">
                {program}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <h3 className="text-lg font-semibold mb-2 relative inline-block">
            Application Requirements
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-blue-400"></span>
          </h3>
          <div className="backdrop-blur-sm bg-gray-800/50 p-3 rounded border border-gray-700/50 shadow-inner text-sm">
            <p>{university.requirements}</p>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button className={`w-full py-3 rounded font-bold relative overflow-hidden group transition-all duration-300
            ${admissionChance.score >= 70
              ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/40'
              : 'bg-blue-600 hover:bg-blue-500'}
          `}>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">SAVE TO FAVORITES</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Placeholder component when no university is selected
const EmptyUniversityDetails = () => (
  <div className="w-1/3 bg-gray-800 p-6 overflow-y-auto relative">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
    <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 relative z-10">
      <div className="w-16 h-16 rounded-full bg-gray-700 mb-4 relative">
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="absolute -inset-1 rounded-full blur opacity-20 bg-blue-500 animate-ping"></div>
      </div>
      <h3 className="text-xl font-medium mb-2">No University Selected</h3>
      <p className="max-w-xs text-gray-500">Click on a university from the list to view detailed information about programs and requirements</p>
      <div className="mt-6 animate-bounce">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
        </svg>
      </div>
    </div>
  </div>
);

export default UniversityDetails;