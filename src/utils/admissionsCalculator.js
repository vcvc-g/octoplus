/**
 * Calculate the acceptance chance for a student at a specific university
 * @param {Object} university - University data
 * @param {Object} profile - Student profile data
 * @returns {Object} - Acceptance chance details
 */
export const calculateAcceptanceChance = (university, profile) => {
  // Calculate median SAT and use it in satPercentile calculation
  const medianSAT = (university.satRange.min + university.satRange.max) / 2;
  // Use medianSAT in the calculation instead of range.min
  const satPercentile = Math.max(0, Math.min(100, (profile.sat - (medianSAT - 100)) / 200 * 100));
  const gpaPercentile = Math.max(0, Math.min(100, (profile.gpa / university.gpaCutoff) * 100));


  // Academic score (weighted 60%)
  const academicScore = (satPercentile * 0.6 + gpaPercentile * 0.4) * 0.6;

  // Course rigor factor (scale 1-5, weighted 15%)
  const rigorFactor = (profile.courseRigor / 5) * 15;

  // Extracurricular/essay quality (weighted 15%)
  const applicationStrengthScore = ((profile.extracurriculars + profile.essayStrength) / 10) * 15;

  // Major competitiveness adjustment (-10% to +5%)
  let majorAdjustment = 0;
  if (profile.intendedMajor) {
    // Sample logic - could be much more detailed with real data
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
  const selectivityFactor = (university.acceptanceRate < 10) ? 0.8 : 1.2;

  // Calculate final score
  let finalScore = (academicScore + rigorFactor + applicationStrengthScore + majorAdjustment + earlyDecisionBonus) * selectivityFactor;

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

export const getAcademicMatchStrength = (studentProfile, university) => {
  if (studentProfile.sat >= university.satRange.min && studentProfile.gpa >= university.gpaCutoff - 0.2) {
    return { text: "Strong", color: "text-green-400", width: "w-4/5", background: "bg-green-500" };
  } else if (studentProfile.sat >= university.satRange.min - 100 && studentProfile.gpa >= university.gpaCutoff - 0.4) {
    return { text: "Moderate", color: "text-yellow-400", width: "w-2/5", background: "bg-yellow-500" };
  } else {
    return { text: "Weak", color: "text-red-400", width: "w-1/5", background: "bg-red-500" };
  }
};

export const getRatingStrength = (rating) => {
  if (rating >= 4) {
    return { text: "Strong", color: "text-green-400", width: "w-4/5", background: "bg-green-500" };
  } else if (rating >= 3) {
    return { text: "Moderate", color: "text-yellow-400", width: "w-3/5", background: "bg-yellow-500" };
  } else {
    return { text: "Weak", color: "text-red-400", width: "w-2/5", background: "bg-red-500" };
  }
};

export const getMajorCompetitiveness = (majorName) => {
  const competitiveMajors = ["Computer Science", "Engineering", "Business"];
  const lesserKnownMajors = ["Anthropology", "Philosophy", "Linguistics"];

  if (competitiveMajors.includes(majorName)) {
    return { text: "High", color: "text-red-400", width: "w-4/5", background: "bg-red-500" };
  } else if (lesserKnownMajors.includes(majorName)) {
    return { text: "Low", color: "text-green-400", width: "w-2/5", background: "bg-green-500" };
  } else {
    return { text: "Medium", color: "text-yellow-400", width: "w-3/5", background: "bg-yellow-500" };
  }
};