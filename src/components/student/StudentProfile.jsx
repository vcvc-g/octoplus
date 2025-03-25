import React from 'react';
import { RatingSelector } from '../ui';
import { filterOptions } from '../../data/filterOptions';
import { useStudentProfile } from '../../context/StudentProfileContext';

const StudentProfile = () => {
  const { studentProfile, updateProfile } = useStudentProfile();

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 shadow-md relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium flex items-center">
            <span>Your Profile:</span>
            <button
              onClick={() => updateProfile('showAdvancedProfile', !studentProfile.showAdvancedProfile)}
              className="ml-2 text-xs px-2 py-0.5 bg-blue-900 rounded hover:bg-blue-800 transition-colors"
            >
              {studentProfile.showAdvancedProfile ? 'Basic View' : 'Advanced View'}
            </button>
          </div>
          <div className="bg-blue-900/50 px-3 py-1 rounded-full text-xs border border-blue-800">
            <span className="text-blue-300 font-medium">Universities are color-coded by your admission chances</span>
          </div>
        </div>

        {/* Basic Profile Inputs */}
        <div className="flex space-x-6 mb-2">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">SAT Score:</span>
            <input
              type="number"
              min="400"
              max="1600"
              step="10"
              value={studentProfile.sat}
              onChange={(e) => updateProfile('sat', Number(e.target.value))}
              className="w-20 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-center"
            />
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">GPA:</span>
            <input
              type="number"
              min="0"
              max="4.0"
              step="0.1"
              value={studentProfile.gpa}
              onChange={(e) => updateProfile('gpa', Number(e.target.value))}
              className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-center"
            />
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Intended Major:</span>
            <select
              value={studentProfile.intendedMajor}
              onChange={(e) => updateProfile('intendedMajor', e.target.value)}
              className="px-2 py-1 bg-gray-700 rounded border border-gray-600 text-sm"
            >
              <option value="">Undecided</option>
              {filterOptions.majors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Profile Inputs - only shown when expanded */}
        {studentProfile.showAdvancedProfile && (
          <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-700">
            <RatingSelector
              label="Course Rigor (1-5):"
              value={studentProfile.courseRigor}
              onChange={(value) => updateProfile('courseRigor', value)}
              description="AP/IB/Honors courses taken"
            />

            <RatingSelector
              label="Extracurriculars (1-5):"
              value={studentProfile.extracurriculars}
              onChange={(value) => updateProfile('extracurriculars', value)}
              description="Activities, leadership, achievements"
            />

            <RatingSelector
              label="Essay Strength (1-5):"
              value={studentProfile.essayStrength}
              onChange={(value) => updateProfile('essayStrength', value)}
              description="Estimated quality of personal essays"
            />

            <div>
              <label className="block text-xs text-gray-400 mb-1">Application Type:</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={studentProfile.earlyDecision}
                  onChange={(e) => updateProfile('earlyDecision', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Early Decision/Action</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Can improve chances at many schools
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;