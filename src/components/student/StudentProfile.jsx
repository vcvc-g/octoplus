// src/components/student/StudentProfile.jsx - Updated with light theme support
import React, { useState } from 'react';
import { RatingSelector } from '../ui';
import { filterOptions } from '../../data/filterOptions';
import { useStudentProfile } from '../../context/StudentProfileContext';
import { useTheme } from '../../context/ThemeContext';
import SubjectTestModal from './SubjectTestModal';
import { US_STATES } from '../../data/usStates';

const StudentProfile = () => {
  const { studentProfile, updateProfile } = useStudentProfile();
  const { isLight } = useTheme();
  const [showSubjectTestModal, setShowSubjectTestModal] = useState(false);

  const openSubjectTestModal = () => {
    setShowSubjectTestModal(true);
  };

  const updateSubjectTests = (tests) => {
    updateProfile('satSubjectTests', tests);
  };

  return (
    <div className={`p-3 shadow-md relative z-10 transition-colors duration-200 ${
      isLight
        ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'
        : 'bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className={`text-sm font-medium flex items-center ${
            isLight ? 'text-gray-700' : 'text-white'
          }`}>
            <span>Your Profile:</span>
            <button
              onClick={() => updateProfile('showAdvancedProfile', !studentProfile.showAdvancedProfile)}
              className={`ml-2 text-xs px-2 py-0.5 rounded transition-colors ${
                isLight
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  : 'bg-blue-900 hover:bg-blue-800 text-white'
              }`}
            >
              {studentProfile.showAdvancedProfile ? 'Basic View' : 'Advanced View'}
            </button>
          </div>
        </div>

        {/* Basic Profile Inputs */}
        <div className="flex space-x-6 mb-2">
          <div className="flex items-center">
            <span className={`mr-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>SAT Score:</span>
            <input
              type="number"
              min="400"
              max="1600"
              step="10"
              value={studentProfile.sat}
              onChange={(e) => updateProfile('sat', Number(e.target.value))}
              className={`w-20 px-2 py-1 rounded border text-center transition-colors ${
                isLight
                  ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>GPA:</span>
            <input
              type="number"
              min="0"
              max="4.0"
              step="0.1"
              value={studentProfile.gpa}
              onChange={(e) => updateProfile('gpa', Number(e.target.value))}
              className={`w-16 px-2 py-1 rounded border text-center transition-colors ${
                isLight
                  ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Intended Major:</span>
            <select
              value={studentProfile.intendedMajor}
              onChange={(e) => updateProfile('intendedMajor', e.target.value)}
              className={`px-2 py-1 rounded border text-sm transition-colors ${
                isLight
                  ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  : 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
              }`}
            >
              <option value="">Undecided</option>
              {filterOptions.majors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Profile Inputs */}
        {studentProfile.showAdvancedProfile && (
          <div className={`grid grid-cols-4 gap-4 mt-3 pt-3 border-t transition-colors ${
            isLight ? 'border-gray-200' : 'border-gray-700'
          }`}>
            <RatingSelector
              label="Course Rigor (1-5):"
              value={studentProfile.courseRigor}
              onChange={(value) => updateProfile('courseRigor', value)}
              description="AP/IB/Honors courses taken"
              theme={isLight ? 'light' : 'dark'}
            />

            <RatingSelector
              label="Extracurriculars (1-5):"
              value={studentProfile.extracurriculars}
              onChange={(value) => updateProfile('extracurriculars', value)}
              description="Activities, leadership, achievements"
              theme={isLight ? 'light' : 'dark'}
            />

            <RatingSelector
              label="Essay Strength (1-5):"
              value={studentProfile.essayStrength}
              onChange={(value) => updateProfile('essayStrength', value)}
              description="Estimated quality of personal essays"
              theme={isLight ? 'light' : 'dark'}
            />

            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Application Type:
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={studentProfile.earlyDecision}
                  onChange={(e) => updateProfile('earlyDecision', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Early Decision/Action</span>
              </div>
              <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                Can improve chances at many schools
              </div>
            </div>

            {/* Additional advanced fields with light theme styling */}
            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                AP Courses:
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.apCount || 0}
                onChange={(e) => updateProfile('apCount', Number(e.target.value))}
                className={`w-16 px-2 py-1 rounded border text-center ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
              />
              <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                Number of AP courses taken
              </div>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                IB Courses:
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.ibCount || 0}
                onChange={(e) => updateProfile('ibCount', Number(e.target.value))}
                className={`w-16 px-2 py-1 rounded border text-center ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
              />
              <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                Number of IB courses taken
              </div>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Honors Courses:
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={studentProfile.honorsCount || 0}
                onChange={(e) => updateProfile('honorsCount', Number(e.target.value))}
                className={`w-16 px-2 py-1 rounded border text-center ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
              />
              <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                Number of Honors courses taken
              </div>
            </div>

            {/* SAT Subject Tests section */}
            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                SAT Subject Tests:
              </label>
              <button
                onClick={openSubjectTestModal}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-700 hover:bg-blue-600 text-white'
                }`}
              >
                Edit Subject Tests
              </button>
              <div className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                {studentProfile.satSubjectTests?.length || 0} tests added
              </div>
            </div>

            {/* Demographic Information */}
            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Race/Ethnicity:
              </label>
              <select
                value={studentProfile.demographics?.race || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, race: e.target.value})}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
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
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Gender:
              </label>
              <select
                value={studentProfile.demographics?.gender || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, gender: e.target.value})}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs mb-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                State:
              </label>
              <select
                value={studentProfile.demographics?.state || ''}
                onChange={(e) => updateProfile('demographics', {...studentProfile.demographics, state: e.target.value})}
                className={`w-full px-2 py-1 rounded border text-sm ${
                  isLight
                    ? 'bg-white border-gray-300 text-gray-900'
                    : 'bg-gray-700 border-gray-600 text-white'
                }`}
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

              <div className={`text-xs mt-2 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
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