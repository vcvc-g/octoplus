// src/utils/dataEnrichment.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API key from .env file
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

console.log("API Key (first few chars):", API_KEY ? API_KEY.substring(0, 5) + "..." : "NOT FOUND");

// Define fields to fetch
const FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.school_url',
  'school.ownership',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.student.size',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.academics.program_percentage',
  'latest.student.demographics.race_ethnicity',
  'latest.student.demographics.men',
  'latest.student.demographics.women',
  'latest.student.retention_rate.four_year.full_time'
].join(',');

/**
 * Find a school by name in the College Scorecard API
 * @param {string} schoolName - The name of the school to find
 * @returns {Promise<Object|null>} - School data or null if not found
 */
async function findSchoolByName(schoolName) {
  try {
    // Clean up the name for search
    let searchName = schoolName
      .replace(/\(.*?\)/g, '') // Remove parentheses and their contents
      .replace(/University of (.+)/, '$1 University') // Try alternative format for "University of X"
      .replace(/\bSt\b\.?/i, 'Saint') // Expand St. to Saint
      .replace(/\bColl\b\.?/i, 'College') // Expand Coll. to College
      .replace(/\bUniv\b\.?/i, 'University') // Expand Univ. to University
      .trim();

    // Create a simpler version for matching
    const simpleName = searchName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .replace(/university|college|institute|school/g, ''); // Remove common words

    console.log(`  Searching for school: "${searchName}" (simplified: "${simpleName}")`);

    const response = await axios.get(BASE_URL, {
      params: {
        'api_key': API_KEY,
        'school.name': searchName,
        'fields': FIELDS,
        'per_page': 10 // Get up to 10 matches to improve chances
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      // Find the best match
      const matches = response.data.results;
      console.log(`  Found ${matches.length} potential matches.`);

      // Look for exact matches first
      for (const match of matches) {
        if (match['school.name'].toLowerCase() === schoolName.toLowerCase()) {
          console.log(`  Found exact match: ${match['school.name']}`);
          return match;
        }
      }

      // Then look for simplified name matches (ignoring punctuation, case, and common words)
      for (const match of matches) {
        const matchSimplified = match['school.name']
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .replace(/university|college|institute|school/g, '');

        if (matchSimplified === simpleName ||
            matchSimplified.includes(simpleName) ||
            simpleName.includes(matchSimplified)) {
          console.log(`  Found close match: "${match['school.name']}" for "${schoolName}"`);
          return match;
        }
      }

      // If no good match found, return the first result
      console.log(`  No ideal match found. Using first result: ${matches[0]['school.name']}`);
      return matches[0];
    }

    console.log(`  No matches found. Trying alternative search...`);

    // Try one more time with a simplified search
    if (searchName.includes('University')) {
      // Try searching without the word "University"
      const simplifiedSearch = searchName.replace(/\s*University\s*/, ' ').trim();

      console.log(`  Trying simplified search: "${simplifiedSearch}"`);

      const simpleResponse = await axios.get(BASE_URL, {
        params: {
          'api_key': API_KEY,
          'school.name': simplifiedSearch,
          'fields': FIELDS,
          'per_page': 5
        }
      });

      if (simpleResponse.data && simpleResponse.data.results && simpleResponse.data.results.length > 0) {
        console.log(`  Found match with simplified search: ${simpleResponse.data.results[0]['school.name']}`);
        return simpleResponse.data.results[0];
      }
    }

    console.log(`  No matches found for "${schoolName}"`);
    return null;
  } catch (error) {
    console.error(`Error finding school "${schoolName}":`, error.message);
    if (error.response) {
      console.error(`  Response status: ${error.response.status}`);
      if (error.response.data && error.response.data.errors) {
        console.error(`  API errors:`, error.response.data.errors);
      }
    }
    return null;
  }
}

/**
 * Get school data directly by College Scorecard ID
 * @param {string} schoolId - The College Scorecard ID
 * @returns {Promise<Object|null>} - School data or null if not found
 */
async function getSchoolById(schoolId) {
  try {
    const response = await axios.get(`${BASE_URL}/${schoolId}`, {
      params: {
        'api_key': API_KEY,
        'fields': FIELDS
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching school with ID "${schoolId}":`, error.message);
    return null;
  }
}

/**
 * Transform API data to our format
 * @param {Object} apiData - Raw API data
 * @returns {Object} - Transformed data in our format
 */
function transformSchoolData(apiData) {
  // Determine if it's a private or public institution
  const ownership = apiData['school.ownership'];
  const type = ownership === 1 ? 'Public' : ownership === 2 ? 'Private' : 'Unknown';

  // Extract location
  const city = apiData['school.city'] || '';
  const state = apiData['school.state'] || '';
  const location = city && state ? `${city}, ${state}` : (city || state || 'United States');

  // Extract SAT range
  const satMin = (apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
                (apiData['latest.admissions.sat_scores.25th_percentile.math'] || 0);

  const satMax = (apiData['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
                (apiData['latest.admissions.sat_scores.75th_percentile.math'] || 0);

  const satRange = satMin > 0 && satMax > 0 ? { min: satMin, max: satMax } : null;

  // Format acceptance rate
  const acceptanceRate = apiData['latest.admissions.admission_rate.overall']
    ? Math.round(apiData['latest.admissions.admission_rate.overall'] * 1000) / 10 // Convert to percentage with 1 decimal
    : null;

  // Get top programs
  let topPrograms = [];
  if (apiData['latest.academics.program_percentage']) {
    // Extract program percentages from the nested structure
    const programData = {};

    // Iterate through all properties that might start with 'latest.academics.program_percentage.'
    for (const key in apiData) {
      if (key.startsWith('latest.academics.program_percentage.')) {
        // Extract the program name from the key (e.g., 'computer' from 'latest.academics.program_percentage.computer')
        const programName = key.replace('latest.academics.program_percentage.', '');
        // Store the percentage value
        programData[programName] = apiData[key];
      }
    }

    // Sort by percentage value (descending) and take top 5
    topPrograms = Object.entries(programData)
      .filter(([_, percentage]) => percentage > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([code, _]) => formatProgramName(code));
  }

  // Extract demographic data
  const demographics = {};

  // Gender data
  if (apiData['latest.student.demographics.men'] !== undefined) {
    demographics.men = apiData['latest.student.demographics.men'];
  }

  if (apiData['latest.student.demographics.women'] !== undefined) {
    demographics.women = apiData['latest.student.demographics.women'];
  }

  // Race/ethnicity data
  const raceEthnicity = {};
  for (const key in apiData) {
    if (key.startsWith('latest.student.demographics.race_ethnicity.')) {
      const raceName = key.replace('latest.student.demographics.race_ethnicity.', '');
      // Only include non-null values and exclude historical data (those with year suffixes)
      if (apiData[key] !== null && !raceName.includes('_20')) {
        raceEthnicity[raceName] = apiData[key];
      }
    }
  }

  // Only add if we have some race/ethnicity data
  if (Object.keys(raceEthnicity).length > 0) {
    demographics.raceEthnicity = raceEthnicity;
  }

  // Add other important demographic data if available
  if (apiData['latest.student.demographics.first_generation'] !== undefined) {
    demographics.firstGeneration = apiData['latest.student.demographics.first_generation'];
  }

  if (apiData['latest.student.demographics.age_entry'] !== undefined) {
    demographics.ageEntry = apiData['latest.student.demographics.age_entry'];
  }

  if (apiData['latest.student.demographics.student_faculty_ratio'] !== undefined) {
    demographics.studentFacultyRatio = apiData['latest.student.demographics.student_faculty_ratio'];
  }

  return {
    apiId: apiData.id,
    name: apiData['school.name'],
    location,
    type,
    acceptanceRate,
    satRange,
    gpaCutoff: null, // Not available from API
    studentCount: apiData['latest.student.size'] || null,
    tuitionInState: apiData['latest.cost.tuition.in_state'] || null,
    tuitionOutState: apiData['latest.cost.tuition.out_of_state'] || null,
    website: apiData['school.school_url'] || null,
    topPrograms,
    // Only add demographics if we have some data
    ...(Object.keys(demographics).length > 0 ? { demographics } : {}),
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Format program name to readable name
 * @param {string} programCode - Program code from API
 * @returns {string} - Human-readable program name
 */
function formatProgramName(programCode) {
  const programNames = {
    // Main CIP categories
    'agriculture': 'Agriculture',
    'resources': 'Natural Resources',
    'architecture': 'Architecture',
    'ethnic_cultural_gender': 'Ethnic, Cultural, & Gender Studies',
    'communication': 'Communication',
    'communications_technology': 'Communications Technology',
    'computer': 'Computer Science',
    'personal_culinary': 'Personal & Culinary Services',
    'education': 'Education',
    'engineering': 'Engineering',
    'engineering_technology': 'Engineering Technology',
    'language': 'Foreign Languages',
    'family_consumer_science': 'Family & Consumer Sciences',
    'legal': 'Legal Studies',
    'english': 'English',
    'humanities': 'Liberal Arts & Humanities',
    'library': 'Library Science',
    'biological': 'Biological Sciences',
    'mathematics': 'Mathematics',
    'military': 'Military Sciences',
    'multidiscipline': 'Interdisciplinary Studies',
    'parks_recreation_fitness': 'Parks & Recreation',
    'philosophy_religious': 'Philosophy & Religion',
    'theology_religious_vocation': 'Theology & Religious Vocations',
    'physical_science': 'Physical Sciences',
    'science_technology': 'Science Technologies',
    'psychology': 'Psychology',
    'security_law_enforcement': 'Security & Law Enforcement',
    'public_administration_social_service': 'Public Administration',
    'social_science': 'Social Sciences',
    'construction': 'Construction Trades',
    'mechanic_repair_technology': 'Mechanic & Repair Technologies',
    'precision_production': 'Precision Production',
    'transportation': 'Transportation',
    'visual_performing': 'Visual & Performing Arts',
    'health': 'Health Professions',
    'business_marketing': 'Business & Marketing',
    'history': 'History',

    // Legacy CIP code mapping (for backward compatibility)
    '01': 'Agriculture',
    '03': 'Natural Resources',
    '04': 'Architecture',
    '05': 'Area Studies',
    '09': 'Communication',
    '10': 'Communications Tech',
    '11': 'Computer Science',
    '13': 'Education',
    '14': 'Engineering',
    '15': 'Engineering Tech',
    '16': 'Foreign Languages',
    '19': 'Family Sciences',
    '22': 'Legal Studies',
    '23': 'English',
    '24': 'Liberal Arts',
    '25': 'Library Science',
    '26': 'Biological Sciences',
    '27': 'Mathematics',
    '29': 'Military Sciences',
    '30': 'Interdisciplinary',
    '31': 'Parks & Recreation',
    '38': 'Philosophy & Religion',
    '40': 'Physical Sciences',
    '41': 'Science Technologies',
    '42': 'Psychology',
    '43': 'Security & Law Enforcement',
    '44': 'Public Administration',
    '45': 'Social Sciences',
    '46': 'Construction Trades',
    '47': 'Mechanic & Repair Tech',
    '48': 'Precision Production',
    '49': 'Transportation',
    '50': 'Visual & Performing Arts',
    '51': 'Health Professions',
    '52': 'Business',
    '54': 'History'
  };

  // Return the mapped program name or a formatted version of the code if not found
  if (programNames[programCode]) {
    return programNames[programCode];
  }

  // Format unknown program codes by replacing underscores with spaces and capitalizing words
  return programCode
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Enrich university data in a JSON file with API data
 * @param {string} jsonPath - Path to the JSON file
 * @param {boolean} verbose - Whether to log details
 * @returns {Promise<void>}
 */
export async function enrichUniversityData(jsonPath, verbose = true) {
  console.log('API Key (first few chars):', API_KEY ? API_KEY.substring(0, 5) + "..." : "NOT FOUND");

  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const universities = jsonData.universities;

    if (verbose) {
      console.log(`Enriching ${universities.length} universities from ${jsonPath}...`);
    }

    // Keep track of progress
    let updated = 0;
    let notFound = 0;
    let errors = 0;

    // Process each university
    for (let i = 0; i < universities.length; i++) {
      const university = universities[i];

      if (verbose) {
        console.log(`Processing ${i+1}/${universities.length}: ${university.name}`);
      }

      try {
        // Always search by name instead of ID
        if (verbose) {
          console.log(`  Searching by name: ${university.name}`);
        }

        const apiData = await findSchoolByName(university.name);

        // If found, update the university data
        if (apiData) {
          if (verbose) {
            console.log(`  ✅ Found data for: ${university.name}`);

            // Log some key fields to verify data is present
            if (apiData['latest.student.demographics.men'] !== undefined) {
              console.log(`  - Male/Female ratio: ${apiData['latest.student.demographics.men']}/${apiData['latest.student.demographics.women']}`);
            }

            // Check if program data exists
            let hasPrograms = false;
            for (const key in apiData) {
              if (key.startsWith('latest.academics.program_percentage.') && apiData[key] > 0) {
                hasPrograms = true;
                break;
              }
            }
            console.log(`  - Has program data: ${hasPrograms ? 'Yes' : 'No'}`);
          }

          const enrichedData = transformSchoolData(apiData);

          // Merge the data, keeping original values for ranking and description
          universities[i] = {
            ...university,
            ...enrichedData,
            qsRank: university.qsRank, // Preserve the original ranking
            usnRank: university.usnRank, // Preserve the original ranking
            description: university.description, // Preserve the original description
            apiId: apiData.id // Update the API ID
          };

          updated++;

          // Add a delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay to 500ms
        } else {
          if (verbose) {
            console.log(`  ❌ Not found: ${university.name}`);
          }
          notFound++;
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${university.name}:`, error.message);
        if (error.response) {
          console.error(`    Status: ${error.response.status}`);
          if (error.response.data) {
            console.error(`    Error details: ${JSON.stringify(error.response.data).substring(0, 100)}...`);
          }
        }
        errors++;
      }
    }

    // Update metadata
    jsonData.metadata.lastUpdated = new Date().toISOString().split('T')[0];

    // Write the updated data back to the file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

    console.log(`
Enrichment complete for ${jsonPath}:
  ✅ Updated: ${updated}
  ❌ Not found: ${notFound}
  ⚠️ Errors: ${errors}
  📝 Total: ${universities.length}
  📅 Last updated: ${jsonData.metadata.lastUpdated}
  `);
  } catch (fileError) {
    console.error(`Error reading or writing file ${jsonPath}:`, fileError.message);
    throw fileError;
  }
}

// Export functions for use in other scripts
export {
  findSchoolByName,
  getSchoolById,
  transformSchoolData
};