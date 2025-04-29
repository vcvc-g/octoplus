/**
 * Enhanced admissions calculator with additional factors from College Scorecard API
 */

/**
 * Calculate the acceptance chance for a student at a specific university
 * @param {Object} university - University data
 * @param {Object} profile - Student profile data
 * @returns {Object} - Acceptance chance details
 */
export const calculateAcceptanceChance = (university, profile) => {
  // Base university metrics (use defaults if data is missing)
  const acceptanceRate = university.acceptanceRate || 50;
  const satRange = university.satRange || { min: 1200, max: 1400 };
  const medianSAT = (satRange.min + satRange.max) / 2;
  const gpaCutoff = university.gpaCutoff || 3.0;

  // Get raw API data if available
  const apiData = university._apiData || {};

  // ===== ACADEMIC FACTORS (50% of total) =====

  // Basic SAT/ACT score evaluation (25%)
  const satPercentile = Math.max(0, Math.min(100, (profile.sat - (medianSAT - 100)) / 200 * 100));

  // SAT Subject Tests (5%)
  const subjectTestScore = profile.satSubjectTests ?
    calculateSubjectTestScore(profile.satSubjectTests, profile.intendedMajor) : 0;

  // GPA evaluation (10%)
  const gpaPercentile = Math.max(0, Math.min(100, (profile.gpa / gpaCutoff) * 100));

  // AP/IB/Honors Course Count (10%)
  const advancedCourseScore = calculateAdvancedCourseScore(
    profile.apCount || 0,
    profile.ibCount || 0,
    profile.honorsCount || 0,
    profile.intendedMajor
  );

  // Combined academic score (50%)
  const academicScore = (
    (satPercentile * 0.25) +
    (subjectTestScore * 0.05) +
    (gpaPercentile * 0.10) +
    (advancedCourseScore * 0.10)
  );

  // ===== PROFILE STRENGTH FACTORS (30% of total) =====

  // Course rigor factor (10%)
  const rigorFactor = (profile.courseRigor / 5) * 10;

  // Extracurricular/essay quality (10%)
  const applicationStrengthScore = ((profile.extracurriculars + profile.essayStrength) / 10) * 10;

  // Legacy/demographic factors (10%)
  const demographicScore = calculateDemographicScore(profile, apiData);

  // ===== INSTITUTIONAL FACTORS (20% of total) =====

  // Major competitiveness (-10% to +5%)
  const majorAdjustment = calculateMajorCompetitiveness(
    profile.intendedMajor,
    apiData['latest.academics.program_percentage']
  );

  // Geographic diversity bonus
  const geoDiversityBonus = calculateGeographicDiversity(profile.state, university);

  // Yield protection penalty (for highly qualified applicants at certain schools)
  const yieldProtectionPenalty = calculateYieldProtection(
    academicScore,
    apiData['latest.admissions.admissions_yield'],
    acceptanceRate
  );

  // Early decision bonus (if applicable)
  const earlyDecisionBonus = profile.earlyDecision ? 10 : 0;

  // ===== CALCULATE FINAL SCORE =====

  // Selectivity adjustment - more impact on very selective schools
  let selectivityFactor = 1.0;
  if (acceptanceRate < 10) {
    selectivityFactor = 0.8; // Harder to predict for very selective schools
  } else if (acceptanceRate > 40) {
    selectivityFactor = 1.2; // Easier to predict for less selective schools
  }

  // Calculate raw score
  let finalScore = (
    academicScore +
    rigorFactor +
    applicationStrengthScore +
    demographicScore +
    majorAdjustment +
    geoDiversityBonus +
    earlyDecisionBonus +
    yieldProtectionPenalty
  ) * selectivityFactor;

  // Adjust based on the university's acceptance rate
  const acceptanceFactor = Math.max(0.5, Math.min(1.5, 50 / acceptanceRate));
  finalScore = finalScore / acceptanceFactor;

  // Ensure reasonable bounds
  finalScore = Math.max(5, Math.min(95, finalScore));

  // Map to categories
  let category = "";
  let color = "";

  if (finalScore >= 80) {
    category = "Safety";
    color = "text-green-400";
  } else if (finalScore >= 40) {
    category = "Target";
    color = "text-yellow-400";
  } else {
    category = "Reach";
    color = "text-red-400";
  }

  return {
    score: Math.round(finalScore),
    category,
    color,
    // Include component scores for detailed feedback
    components: {
      academic: Math.round(academicScore),
      rigor: Math.round(rigorFactor),
      applicationStrength: Math.round(applicationStrengthScore),
      demographic: Math.round(demographicScore),
      majorFit: Math.round(majorAdjustment),
      earlyDecision: earlyDecisionBonus,
      yieldProtection: Math.round(yieldProtectionPenalty)
    }
  };
};

/**
 * Calculate score based on SAT Subject Tests
 * @param {Array} subjectTests - Array of subject test scores by subject
 * @param {string} intendedMajor - Student's intended major
 * @returns {number} - Subject test score (0-100)
 */
function calculateSubjectTestScore(subjectTests, intendedMajor) {
  if (!subjectTests || !subjectTests.length) return 0;

  // Define relevant subject tests by major
  const majorToSubjects = {
    "Computer Science": ["Math Level 2", "Physics"],
    "Engineering": ["Math Level 2", "Physics", "Chemistry"],
    "Business": ["Math Level 1", "Math Level 2"],
    "Biology": ["Biology", "Chemistry"],
    "Chemistry": ["Chemistry", "Math Level 2"],
    "Physics": ["Physics", "Math Level 2"],
    "Mathematics": ["Math Level 2"],
    "English": ["Literature"],
    "History": ["World History", "U.S. History"],
    "Psychology": ["Biology"],
    "Economics": ["Math Level 2"],
    "Political Science": ["World History", "U.S. History"]
  };

  // Get relevant subjects for the major
  const relevantSubjects = majorToSubjects[intendedMajor] || [];

  // Calculate average score
  let totalScore = 0;
  let count = 0;

  subjectTests.forEach(test => {
    let weight = 1;
    if (relevantSubjects.includes(test.subject)) {
      weight = 2; // Give double weight to relevant subjects
    }
    totalScore += (test.score / 800) * 100 * weight;
    count += weight;
  });

  return count > 0 ? totalScore / count : 0;
}

/**
 * Calculate score based on AP/IB/Honors courses
 * @param {number} apCount - Number of AP courses
 * @param {number} ibCount - Number of IB courses
 * @param {number} honorsCount - Number of Honors courses
 * @param {string} intendedMajor - Student's intended major
 * @returns {number} - Advanced course score (0-100)
 */
function calculateAdvancedCourseScore(apCount, ibCount, honorsCount, intendedMajor) {
  // Calculate total advanced courses
  const totalCourses = apCount + ibCount + honorsCount;

  // Base score based on total advanced courses
  let baseScore = 0;
  if (totalCourses >= 10) baseScore = 100;
  else if (totalCourses >= 8) baseScore = 90;
  else if (totalCourses >= 6) baseScore = 80;
  else if (totalCourses >= 4) baseScore = 70;
  else if (totalCourses >= 2) baseScore = 50;
  else if (totalCourses >= 1) baseScore = 30;

  // Define major-relevant course categories (simplified)
  const majorToCourseCategories = {
    "Computer Science": ["STEM"],
    "Engineering": ["STEM"],
    "Business": ["STEM", "Social Sciences"],
    "Mathematics": ["STEM"],
    "Biology": ["STEM", "Science"],
    "Chemistry": ["STEM", "Science"],
    "Physics": ["STEM", "Science"],
    "English": ["Humanities"],
    "History": ["Humanities", "Social Sciences"],
    "Psychology": ["Science", "Social Sciences"],
    "Economics": ["STEM", "Social Sciences"]
  };

  // No adjustment if no intended major or if we don't have category data
  if (!intendedMajor || !majorToCourseCategories[intendedMajor]) {
    return baseScore;
  }

  // Apply a bonus/penalty based on the match between courses and intended major
  // This is a simplified approximation; in reality, would need actual course data
  const bonus = 0; // Placeholder for a more detailed implementation

  return Math.min(100, baseScore + bonus);
}

/**
 * Calculate demographic score based on institutional priorities
 * @param {Object} profile - Student profile
 * @param {Object} apiData - Raw API data from university
 * @returns {number} - Demographic score adjustment (-10 to +10)
 */
function calculateDemographicScore(profile, apiData) {
  // Base score
  let score = 0;

  // Check for demographic data
  if (!apiData['latest.student.demographics'] || !profile.demographics) {
    return score;
  }

  // Get university demographics
  const uniDemographics = apiData['latest.student.demographics'];

  // First-generation student bonus (if university has low first-gen percentage)
  if (profile.demographics.firstGeneration &&
      uniDemographics.first_generation &&
      uniDemographics.first_generation < 0.3) {
    score += 5;
  }

  // Racial/ethnic diversity considerations
  if (profile.demographics.race && uniDemographics.race_ethnicity) {
    const raceData = uniDemographics.race_ethnicity;

    // Simplified: give slight bonus to underrepresented groups at this institution
    // A more sophisticated version would use national and historical data
    if (profile.demographics.race === 'black' && raceData.black < 0.1) {
      score += 5;
    } else if (profile.demographics.race === 'hispanic' && raceData.hispanic < 0.1) {
      score += 5;
    } else if (profile.demographics.race === 'asian' && raceData.asian < 0.1) {
      score += 3;
    }
  }

  // Gender demographics consideration
  if (profile.demographics.gender && uniDemographics.men && uniDemographics.women) {
    // Give slight bonus to underrepresented gender
    if (profile.demographics.gender === 'male' && uniDemographics.men < 0.4) {
      score += 3;
    } else if (profile.demographics.gender === 'female' && uniDemographics.women < 0.4) {
      score += 3;
    }
  }

  // Legacy status
  if (profile.demographics.legacy) {
    score += 7; // Significant bonus for legacy status
  }

  // Other factors could include: recruited athlete, development case, etc.

  return score;
}

/**
 * Calculate major competitiveness based on program size and popularity
 * @param {string} intendedMajor - Student's intended major
 * @param {Object} programPercentages - Program percentage data from API
 * @returns {number} - Major adjustment score (-10 to +5)
 */
function calculateMajorCompetitiveness(intendedMajor, programPercentages) {
  if (!intendedMajor || !programPercentages) {
    // Use default hardcoded values if API data isn't available
    const competitiveMajors = ["Computer Science", "Engineering", "Business"];
    const lesserKnownMajors = ["Anthropology", "Philosophy", "Linguistics"];

    if (competitiveMajors.includes(intendedMajor)) {
      return -10; // Harder to get in for competitive majors
    } else if (lesserKnownMajors.includes(intendedMajor)) {
      return 5; // Easier for less competitive majors
    }
    return 0;
  }

  // Map common majors to CIP codes (simplified)
  const majorToCIPCode = {
    "Computer Science": "11",
    "Engineering": "14",
    "Business": "52",
    "Mathematics": "27",
    "Physics": "40",
    "Chemistry": "40",
    "Biology": "26",
    "Psychology": "42",
    "Economics": "45",
    "English": "23",
    "History": "54",
    "Political Science": "45"
  };

  // Get CIP code for the major
  const cipCode = majorToCIPCode[intendedMajor];
  if (!cipCode) return 0;

  // Get program percentage if available
  let percentage = 0;
  Object.entries(programPercentages).forEach(([code, value]) => {
    if (code.startsWith(cipCode)) {
      percentage += value;
    }
  });

  // Adjust score based on program size
  // Smaller programs might be less competitive, larger programs more competitive
  if (percentage > 0.15) {
    return -10; // Very popular major = harder to get in
  } else if (percentage > 0.1) {
    return -5; // Popular major = somewhat harder
  } else if (percentage > 0.05) {
    return 0; // Average popularity
  } else if (percentage > 0.01) {
    return 3; // Less popular = somewhat easier
  } else {
    return 5; // Very small program = potentially easier
  }
}

/**
 * Calculate geographic diversity bonus
 * @param {string} studentState - Student's home state
 * @param {Object} university - University data
 * @returns {number} - Geographic diversity bonus (0 to 5)
 */
function calculateGeographicDiversity(studentState, university) {
  if (!studentState || !university.location) return 0;

  // Extract university state (simplified)
  const uniState = university.location.split(', ')[1];

  // Out-of-state students may get a boost
  if (uniState && studentState !== uniState) {
    // Geographic regions that might be underrepresented at this university
    // Would ideally use data from the API about student geographic distribution
    return 3;
  }

  return 0;
}

/**
 * Calculate yield protection penalty
 * @param {number} academicScore - Student's academic score
 * @param {number} yieldRate - University's yield rate
 * @param {number} acceptanceRate - University's acceptance rate
 * @returns {number} - Yield protection penalty (negative number)
 */
function calculateYieldProtection(academicScore, yieldRate, acceptanceRate) {
  // Only apply yield protection to certain schools
  // Schools with low yield rates and moderate selectivity may be most likely
  // to practice yield protection
  if (yieldRate && yieldRate < 0.35 && acceptanceRate > 10 && acceptanceRate < 40) {
    // If student is very overqualified
    if (academicScore > 90) {
      return -10; // Significant penalty
    } else if (academicScore > 80) {
      return -5; // Moderate penalty
    }
  }

  return 0;
}

/**
 * Get the strength of the academic match between student and university
 * @param {Object} studentProfile - Student profile data
 * @param {Object} university - University data
 * @returns {Object} - Match strength
 */
export const getAcademicMatchStrength = (studentProfile, university) => {
  // Calculate SAT percentile
  const satRange = university.satRange || { min: 1200, max: 1400 };
  const gpaCutoff = university.gpaCutoff || 3.0;

  if (studentProfile.sat >= satRange.min && studentProfile.gpa >= gpaCutoff - 0.2) {
    return { text: "Strong", color: "text-green-400", width: "w-4/5", background: "bg-green-500" };
  } else if (studentProfile.sat >= satRange.min - 100 && studentProfile.gpa >= gpaCutoff - 0.4) {
    return { text: "Moderate", color: "text-yellow-400", width: "w-2/5", background: "bg-yellow-500" };
  } else {
    return { text: "Weak", color: "text-red-400", width: "w-1/5", background: "bg-red-500" };
  }
};

/**
 * Get the strength of a rating (1-5 scale)
 * @param {number} rating - Rating value (1-5)
 * @returns {Object} - Strength indicator
 */
export const getRatingStrength = (rating) => {
  if (rating >= 4) {
    return { text: "Strong", color: "text-green-400", width: "w-4/5", background: "bg-green-500" };
  } else if (rating >= 3) {
    return { text: "Moderate", color: "text-yellow-400", width: "w-3/5", background: "bg-yellow-500" };
  } else {
    return { text: "Weak", color: "text-red-400", width: "w-2/5", background: "bg-red-500" };
  }
};

/**
 * Get the competitiveness level of a major
 * @param {string} majorName - Name of the major
 * @returns {Object} - Competitiveness indicator
 */
export const getMajorCompetitiveness = (majorName) => {
  // Enhanced list of majors by competitiveness
  const highlyCompetitiveMajors = [
    "Computer Science",
    "Data Science",
    "Engineering",
    "Nursing",
    "Business Administration",
    "Finance",
    "Pre-Medicine",
    "Artificial Intelligence"
  ];

  const moderatelyCompetitiveMajors = [
    "Economics",
    "Biology",
    "Psychology",
    "Mathematics",
    "Communications",
    "Political Science",
    "Chemistry",
    "Marketing"
  ];

  const lessCompetitiveMajors = [
    "Anthropology",
    "Philosophy",
    "Linguistics",
    "History",
    "Religious Studies",
    "Liberal Arts",
    "Geography",
    "Social Work"
  ];

  if (highlyCompetitiveMajors.includes(majorName)) {
    return { text: "High", color: "text-red-400", width: "w-4/5", background: "bg-red-500" };
  } else if (moderatelyCompetitiveMajors.includes(majorName)) {
    return { text: "Medium", color: "text-yellow-400", width: "w-3/5", background: "bg-yellow-500" };
  } else if (lessCompetitiveMajors.includes(majorName)) {
    return { text: "Low", color: "text-green-400", width: "w-2/5", background: "bg-green-500" };
  } else {
    // Default for unknown majors
    return { text: "Medium", color: "text-yellow-400", width: "w-3/5", background: "bg-yellow-500" };
  }
};

/**
 * Helper function to determine color based on score
 * @param {number} score - Score value
 * @returns {string} - Tailwind color class
 */
export const getColorForScore = (score) => {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};

/**
 * Helper function to determine background based on score
 * @param {number} score - Score value
 * @returns {string} - Tailwind background class
 */
export const getBackgroundForScore = (score) => {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Helper function to determine width based on score
 * @param {number} score - Score value
 * @returns {string} - Tailwind width class
 */
export const getWidthForScore = (score) => {
  return `w-[${Math.max(5, Math.min(100, score))}%]`;
};