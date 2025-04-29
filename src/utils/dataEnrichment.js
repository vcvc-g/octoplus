// src/utils/dataEnrichment.js
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// API key from .env file
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

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
    const searchName = schoolName
      .replace(/\(.*?\)/g, '') // Remove parentheses and their contents
      .trim();

    const response = await axios.get(BASE_URL, {
      params: {
        'api_key': API_KEY,
        'school.name': searchName,
        'fields': FIELDS,
        'per_page': 5 // Get up to 5 matches
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      // Find the best match
      const matches = response.data.results;

      // Look for exact matches first
      for (const match of matches) {
        if (match['school.name'].toLowerCase() === searchName.toLowerCase()) {
          return match;
        }
      }

      // Otherwise return the first match
      return matches[0];
    }

    return null;
  } catch (error) {
    console.error(`Error finding school "${schoolName}":`, error.message);
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
    topPrograms = Object.entries(apiData['latest.academics.program_percentage'])
      .filter(([_, percentage]) => percentage > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([code, _]) => formatProgramName(code));
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
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

/**
 * Format program CIP code to readable name
 * @param {string} cipCode - CIP code from API
 * @returns {string} - Human-readable program name
 */
function formatProgramName(cipCode) {
  const programNames = {
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

  const category = cipCode.substring(0, 2);
  return programNames[category] || 'Other';
}

/**
 * Enrich university data in a JSON file with API data
 * @param {string} jsonPath - Path to the JSON file
 * @param {boolean} verbose - Whether to log details
 * @returns {Promise<void>}
 */
export async function enrichUniversityData(jsonPath, verbose = true) {
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
      // Check if we have an API ID already
      let apiData = null;

      if (university.apiId) {
        // Use the existing API ID
        apiData = await getSchoolById(university.apiId);
      }

      // If no API ID or not found with ID, try by name
      if (!apiData) {
        apiData = await findSchoolByName(university.name);
      }

      // If found, update the university data
      if (apiData) {
        const enrichedData = transformSchoolData(apiData);

        // Merge the data, keeping original values for ranking
        universities[i] = {
          ...university,
          ...enrichedData,
          qsRank: university.qsRank, // Preserve the original ranking
          usnRank: university.usnRank, // Preserve the original ranking
          apiId: apiData.id // Update the API ID
        };

        updated++;

        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        if (verbose) {
          console.log(`  ❌ Not found: ${university.name}`);
        }
        notFound++;
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${university.name}:`, error.message);
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
}

/**
 * Main function to run the enrichment
 */
async function main() {
  console.log('Starting university data enrichment...');

  // Check if API key is configured
  if (!API_KEY) {
    console.error('Error: College Scorecard API key not found in environment variables.');
    console.error('Please set COLLEGE_SCORECARD_API_KEY environment variable.');
    process.exit(1);
  }

  // Enrich both datasets
//   await enrichUniversityData(path.join(__dirname, '../data/qs100.json'));
  await enrichUniversityData(path.join(__dirname, '../data/usnewsTop100.json'));

  console.log('All university data enrichment complete!');
}

// Run the script if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Error in main function:', error);
    process.exit(1);
  });
}

// Export functions for use in other scripts
export {
  findSchoolByName,
  getSchoolById,
  transformSchoolData,
  enrichUniversityData
};