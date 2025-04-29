import React, { useState } from 'react';
import { RatingSelector } from '../ui';
import { filterOptions } from '../../data/filterOptions';
import { useStudentProfile } from '../../context/StudentProfileContext';
import SubjectTestModal from './SubjectTestModal';
import { US_STATES } from '../../data/usStates'; // Create this file with state codes

const StudentProfile = () => {
  const { studentProfile, updateProfile } = useStudentProfile();
  const [showSubjectTestModal, setShowSubjectTestModal] = useState(false);

  const openSubjectTestModal = () => {
    setShowSubjectTestModal(true);
  };

  const updateSubjectTests = (tests) => {
    updateProfile('satSubjectTests', tests);
  };

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

            {/* New Advanced Course Counts */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">AP Courses:</label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.apCount || 0}
                onChange={(e) => updateProfile('apCount', Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-center"
              />
              <div className="text-xs text-gray-500 mt-1">
                Number of AP courses taken
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">IB Courses:</label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.ibCount || 0}
                onChange={(e) => updateProfile('ibCount', Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-center"
              />
              <div className="text-xs text-gray-500 mt-1">
                Number of IB courses taken
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Honors Courses:</label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.honorsCount || 0}
                onChange={(e) => updateProfile('honorsCount', Number(e.target.value))}
                className="w-16 px-2 py-1 bg-gray-700 rounded border border-gray-600 text-center"
              />
              <div className="text-xs text-gray-500 mt-1">
                Number of Honors courses taken
              </div>
            </div>

            {/* SAT Subject Tests section */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">SAT Subject Tests:</label>
              <button
                onClick={openSubjectTestModal}
                className="px-3 py-1 bg-blue-700 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Edit Subject Tests
              </button>
              <div className="text-xs text-gray-500 mt-1">
                {studentProfile.satSubjectTests?.length || 0} tests added
              </div>
            </div>

            {/* Demographic Information */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Race/Ethnicity:</label>
              <select
                value={studentProfile.demographics?.race || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, race: e.target.value})}
                className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600 text-sm"
              >
                <option value="">Select...</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="hispanic">Hispanic/Latino</option>
                <option value="asian">Asian</option>
                <option value="aian">American Indian/Alaska Native</option>
                <option value="nhpi">Native Hawaiian/Pacific Islander</option>
                <option value="two_or_more">Two or More Races</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Gender:</label>
              <select
                value={studentProfile.demographics?.gender || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, gender: e.target.value})}
                className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600 text-sm"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">State:</label>
              <select
                value={studentProfile.demographics?.state || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, state: e.target.value})}
                className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600 text-sm"
              >
                <option value="">Select...</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.name}</option>
                ))}
              </select>
            </div>

            {/* Demographics Checkboxes */}
            <div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={studentProfile.demographics?.firstGeneration || false}
                  onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, firstGeneration: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">First Generation</span>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={studentProfile.demographics?.legacy || false}
                  onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, legacy: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm">Legacy</span>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Additional demographic factors
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subject Tests Modal */}
      <SubjectTestModal
        isOpen={showSubjectTestModal}
        onClose={() => setShowSubjectTestModal(false)}
        satSubjectTests={studentProfile.satSubjectTests || []}
        updateSubjectTests={updateSubjectTests}
      />
    </div>
  );
};

export default StudentProfile;