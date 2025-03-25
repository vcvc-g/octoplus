import React, { createContext, useState, useContext } from 'react';

const defaultProfile = {
  sat: 1400,
  gpa: 3.8,
  courseRigor: 3,
  extracurriculars: 3,
  essayStrength: 3,
  intendedMajor: '',
  earlyDecision: false,
  showAdvancedProfile: false
};

const StudentProfileContext = createContext();

export const StudentProfileProvider = ({ children }) => {
  // Add localStorage persistence
  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('studentProfile');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch (e) {
      console.error("Could not load profile from localStorage", e);
      return defaultProfile;
    }
  });

  const updateProfile = (field, value) => {
    setStudentProfile(prev => {
      const newProfile = {
        ...prev,
        [field]: value
      };

      // Save to localStorage
      try {
        localStorage.setItem('studentProfile', JSON.stringify(newProfile));
      } catch (e) {
        console.error("Could not save profile to localStorage", e);
      }

      return newProfile;
    });
  };

  return (
    <StudentProfileContext.Provider value={{ studentProfile, updateProfile, setStudentProfile }}>
      {children}
    </StudentProfileContext.Provider>
  );
};

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (!context) {
    throw new Error('useStudentProfile must be used within a StudentProfileProvider');
  }
  return context;
};