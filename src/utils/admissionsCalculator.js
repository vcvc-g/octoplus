/**
 * Enhanced admissions calculator to work with College Scorecard API data
 */

/**
 * Calculate the acceptance chance for a student at a specific university
 * @param {Object} university - University data
 * @param {Object} profile - Student profile data
 * @returns {Object} - Acceptance chance details
 */
export const calculateAcceptanceChance = (university, profile) => {
  // If the university doesn't have a valid acceptance rate, use a default
  const acceptanceRate = university.acceptanceRate || 50;

  // Check for valid SAT range, if not available, use reasonable defaults
  const satRange = university.satRange || { min: 1200, max: 1400 };
  const medianSAT = (satRange.min + satRange.max) / 2;

  // Calculate SAT percentile (how student compares to university median)
  const satPercentile = Math.max(0, Math.min(100, (profile.sat - (medianSAT - 100)) / 200 * 100));

  // Calculate GPA percentile (how student's GPA compares to university cutoff)
  const gpaCutoff = university.gpaCutoff || 3.0;
  const gpaPercentile = Math.max(0, Math.min(100, (profile.gpa / gpaCutoff) * 100));

  // Academic score (weighted 60%)
  const academicScore = (satPercentile * 0.6 + gpaPercentile * 0.4) * 0.6;

  // Course rigor factor (scale 1-5, weighted 15%)
  const rigorFactor = (profile.courseRigor / 5) * 15;

  // Extracurricular/essay quality (weighted 15%)
  const applicationStrengthScore = ((profile.extracurriculars + profile.essayStrength) / 10) * 15;

  // Major competitiveness adjustment (-10% to +5%)
  let majorAdjustment = 0;
  if (profile.intendedMajor) {
    // Sample logic - could be more detailed with real data
    const competitiveMajors = ["Computer Science", "Engineering", "Business"];
    const lesserKnownMajors = ["Anthropology", "Philosophy", "Linguistics"];

    if (competitiveMajors.includes(profile.intendedMajor)) {
      majorAdjustment = -10; // Harder to get in for competitive majors
    } else if (lesserKnownMajors.includes(profile.intendedMajor)) {
      majorAdjustment = 5; // Easier for less competitive majors
    }
  }

  // Early decision bonus (if applicable)
  const earlyDecisionBonus = profile.earlyDecision ? 10 : 0;

  // Selectivity adjustment - more impact on very selective schools
  let selectivityFactor = 1.0;
  if (acceptanceRate < 10) {
    selectivityFactor = 0.8; // Harder to predict for very selective schools
  } else if (acceptanceRate > 40) {
    selectivityFactor = 1.2; // Easier to predict for less selective schools
  }

  // Calculate final score
  let finalScore = (academicScore + rigorFactor + applicationStrengthScore + majorAdjustment + earlyDecisionBonus) * selectivityFactor;

  // Adjust based on the university's acceptance rate
  // The lower the acceptance rate, the harder it is to get in
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
    color
  };
};

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