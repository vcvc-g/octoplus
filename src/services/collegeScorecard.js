// src/services/collegeScorecard.js
import axios from 'axios';

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

/**
 * Service to interact with the College Scorecard API
 */
class CollegeScorecardService {
  constructor() {
    this.apiKey = process.env.REACT_APP_SCORECARD_API_KEY || '';
    this.cache = new Map();
    this.cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get universities with filtering options
   * @param {Object} options - Filter options
   * @param {string} options.name - Name search
   * @param {string} options.state - State filter (e.g., NY, CA)
   * @param {string} options.region - Region filter
   * @param {number} options.minAcceptanceRate - Minimum acceptance rate
   * @param {number} options.maxAcceptanceRate - Maximum acceptance rate
   * @param {string} options.type - Institution type (public, private)
   * @param {number} options.page - Page number for pagination
   * @param {number} options.perPage - Results per page
   * @returns {Promise<Object>} - Universities data
   */
  async getUniversities({
    name = '',
    state = '',
    region = '',
    minAcceptanceRate = 0,
    maxAcceptanceRate = 100,
    type = '',
    page = 0,
    perPage = 20
  } = {}) {
    try {
      // Generate a cache key based on parameters
      const cacheKey = JSON.stringify({
        name, state, region, minAcceptanceRate, maxAcceptanceRate, type, page, perPage
      });

      // Check if we have a valid cached response
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheExpiration) {
          return cachedData.data;
        }
      }

      // Build the query parameters
      let params = {
        'api_key': this.apiKey,
        'page': page,
        'per_page': perPage,
        'fields': this._getFieldsParameter(),
        '_sort': 'latest.admissions.admission_rate.overall'
      };

      // Add filters
      if (name) {
        params['school.name'] = name;
      }

      if (state) {
        params['school.state'] = state;
      }

      if (type) {
        if (type.toLowerCase() === 'public') {
          params['school.ownership'] = 1;
        } else if (type.toLowerCase() === 'private') {
          params['school.ownership'] = 2;
        }
      }

      if (minAcceptanceRate > 0 || maxAcceptanceRate < 100) {
        params['latest.admissions.admission_rate.overall__range'] =
          `${minAcceptanceRate / 100}..${maxAcceptanceRate / 100}`;
      }

      // Make the API request
      const response = await axios.get(BASE_URL, { params });

      // Transform the data to match our application's format
      const transformedData = this._transformCollegeData(response.data);

      // Cache the response
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now()
      });

      return transformedData;

    } catch (error) {
      console.error('Error fetching data from College Scorecard API:', error);
      throw error;
    }
  }

  /**
   * Get details for a specific university by ID
   * @param {string} id - College Scorecard institution ID
   * @returns {Promise<Object>} - University details
   */
  async getUniversityById(id) {
    try {
      const cacheKey = `university_${id}`;

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheExpiration) {
          return cachedData.data;
        }
      }

      const response = await axios.get(`${BASE_URL}/${id}`, {
        params: {
          'api_key': this.apiKey,
          'fields': this._getFieldsParameter(true)
        }
      });

      // Transform to match our application's university model
      const university = this._transformUniversityDetail(response.data.results[0]);

      // Cache the result
      this.cache.set(cacheKey, {
        data: university,
        timestamp: Date.now()
      });

      return university;

    } catch (error) {
      console.error(`Error fetching university with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Clear the service cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Define which fields to request from the API
   * @param {boolean} detailed - Whether to include additional fields for detailed view
   * @returns {string} - Comma-separated field list
   */
  _getFieldsParameter(detailed = false) {
    const baseFields = [
      'id',
      'school.name',
      'school.city',
      'school.state',
      'school.school_url',
      'school.ownership',
      'school.region_id',
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.25th_percentile.critical_reading',
      'latest.admissions.sat_scores.75th_percentile.critical_reading',
      'latest.admissions.sat_scores.25th_percentile.math',
      'latest.admissions.sat_scores.75th_percentile.math',
      'latest.student.size',
      'latest.cost.tuition.in_state',
      'latest.cost.tuition.out_of_state'
    ];

    if (detailed) {
      return [
        ...baseFields,
        'school.carnegie_basic',
        'school.locale',
        'school.degrees_awarded.predominant',
        'latest.admissions.admission_rate.by_ope_id',
        'latest.admissions.sat_scores.midpoint.critical_reading',
        'latest.admissions.sat_scores.midpoint.math',
        'latest.admissions.act_scores.25th_percentile.cumulative',
        'latest.admissions.act_scores.75th_percentile.cumulative',
        'latest.earnings.10_yrs_after_entry.median',
        'latest.academics.program_percentage',
        'latest.student.demographics.race_ethnicity',
        'latest.completion.rate_suppressed.overall'
      ].join(',');
    }

    return baseFields.join(',');
  }

  /**
   * Transform College Scorecard data to match our application's format
   * @param {Object} data - API response data
   * @returns {Object} - Transformed data
   */
  _transformCollegeData(data) {
    return {
      metadata: {
        total: data.metadata.total,
        page: data.metadata.page,
        perPage: data.metadata.per_page
      },
      universities: data.results.map(college => this._transformUniversityItem(college))
    };
  }

  /**
   * Transform a university item to match our application's model
   * @param {Object} college - College data from API
   * @returns {Object} - Transformed university object
   */
  _transformUniversityItem(college) {
    // Calculate rank approximation (simplified for demo)
    const admissionRate = college['latest.admissions.admission_rate.overall'] || 0.5;
    let qsRank = Math.min(Math.round((1 - admissionRate) * 200), 400);

    // Adjust for missing data
    if (!college['latest.admissions.sat_scores.25th_percentile.math']) {
      qsRank += 50; // Penalty for missing data
    }

    // Determine university type
    let type = 'Unknown';
    if (college['school.ownership'] === 1) {
      type = 'Public';
    } else if (college['school.ownership'] === 2) {
      type = 'Private';
    }

    // Format SAT range
    const satMin =
      (college['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
      (college['latest.admissions.sat_scores.25th_percentile.math'] || 0);

    const satMax =
      (college['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
      (college['latest.admissions.sat_scores.75th_percentile.math'] || 0);

    return {
      id: college.id,
      name: college['school.name'],
      location: college['school.state'] ? `${college['school.city']}, ${college['school.state']}` : 'United States',
      type: type,
      qsRank: qsRank,
      acceptanceRate: Math.round(admissionRate * 100 * 10) / 10,
      satRange: {
        min: satMin || 1200,
        max: satMax || 1400
      },
      gpaCutoff: 3.0, // Not provided by API, using default
      studentCount: college['latest.student.size'] || 0,
      tuitionInState: college['latest.cost.tuition.in_state'] || 0,
      tuitionOutState: college['latest.cost.tuition.out_of_state'] || 0,
      website: college['school.school_url'] || ''
    };
  }

  /**
   * Transform detailed university data
   * @param {Object} college - College detail from API
   * @returns {Object} - University detail object
   */
  _transformUniversityDetail(college) {
    // Get the base transformation
    const university = this._transformUniversityItem(college);

    // Generate a more detailed description
    const description = this._generateUniversityDescription(college);

    // Determine top programs based on program percentages
    let topPrograms = [];
    if (college['latest.academics.program_percentage']) {
      // Find the top 5 programs
      const programs = Object.entries(college['latest.academics.program_percentage'])
        .filter(([key, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key]) => this._formatProgramName(key));

      topPrograms = programs;
    }

    // Add more detailed data
    return {
      ...university,
      description: description,
      topPrograms: topPrograms.length > 0 ? topPrograms : ["Liberal Arts", "Business", "Engineering"],
      completionRate: college['latest.completion.rate_suppressed.overall']
        ? Math.round(college['latest.completion.rate_suppressed.overall'] * 100)
        : null,
      medianEarnings: college['latest.earnings.10_yrs_after_entry.median'] || null,
      requirements: this._generateRequirementsText(college),
      // Add demographics if available
      demographics: college['latest.student.demographics.race_ethnicity'] || null
    };
  }

  /**
   * Generate a descriptive paragraph about the university
   * @param {Object} college - College data
   * @returns {string} - Description text
   */
  _generateUniversityDescription(college) {
    const name = college['school.name'];
    const type = college['school.ownership'] === 1
      ? 'public'
      : college['school.ownership'] === 2
        ? 'private'
        : '';

    const size = college['latest.student.size'];
    let sizeDesc = '';

    if (size) {
      if (size < 2000) sizeDesc = 'small';
      else if (size < 10000) sizeDesc = 'medium-sized';
      else if (size < 20000) sizeDesc = 'large';
      else sizeDesc = 'very large';
    }

    const admissionRate = college['latest.admissions.admission_rate.overall'];
    let selectivity = '';

    if (admissionRate) {
      if (admissionRate < 0.1) selectivity = 'highly selective';
      else if (admissionRate < 0.3) selectivity = 'selective';
      else if (admissionRate < 0.7) selectivity = 'moderately selective';
      else selectivity = 'less selective';
    }

    // Build the description
    return `${name} is a ${sizeDesc} ${type} institution located in ${college['school.city']}, ${college['school.state']}. It is a ${selectivity} university with an acceptance rate of ${Math.round(admissionRate * 100)}%. The university offers a range of academic programs and has approximately ${size.toLocaleString()} enrolled students.`;
  }

  /**
   * Generate text about application requirements
   * @param {Object} college - College data
   * @returns {string} - Requirements text
   */
  _generateRequirementsText(college) {
    const satReading = college['latest.admissions.sat_scores.midpoint.critical_reading'];
    const satMath = college['latest.admissions.sat_scores.midpoint.math'];
    const act = college['latest.admissions.act_scores.midpoint.cumulative'];

    let requirements = 'Application requirements typically include:';

    requirements += '\n• High school transcript';
    requirements += '\n• Letters of recommendation';

    if (satReading && satMath) {
      requirements += `\n• SAT scores (mid-range: ${satReading + satMath} combined)`;
    }

    if (act) {
      requirements += `\n• ACT scores (mid-range: ${act} composite)`;
    }

    requirements += '\n• Personal statement or essays';
    requirements += '\n• Application fee or fee waiver';

    return requirements;
  }

  /**
   * Format program CIP code to readable name
   * @param {string} cipCode - CIP code from API
   * @returns {string} - Human-readable program name
   */
  _formatProgramName(cipCode) {
    // Map of CIP codes to readable names (simplified)
    const programNames = {
      '01': 'Agriculture',
      '03': 'Natural Resources',
      '04': 'Architecture',
      '05': 'Area Studies',
      '09': 'Communication',
      '10': 'Communications Technologies',
      '11': 'Computer Science',
      '13': 'Education',
      '14': 'Engineering',
      '15': 'Engineering Technologies',
      '16': 'Foreign Languages',
      '19': 'Family Sciences',
      '22': 'Legal Studies',
      '23': 'English',
      '24': 'Liberal Arts',
      '25': 'Library Science',
      '26': 'Biological Sciences',
      '27': 'Mathematics',
      '29': 'Military Technologies',
      '30': 'Interdisciplinary Studies',
      '31': 'Parks and Recreation',
      '38': 'Philosophy and Religion',
      '40': 'Physical Sciences',
      '41': 'Science Technologies',
      '42': 'Psychology',
      '43': 'Security and Protective Services',
      '44': 'Public Administration',
      '45': 'Social Sciences',
      '46': 'Construction Trades',
      '47': 'Mechanic and Repair Technologies',
      '48': 'Precision Production',
      '49': 'Transportation',
      '50': 'Visual and Performing Arts',
      '51': 'Health Professions',
      '52': 'Business',
      '54': 'History'
    };

    // Get the 2-digit CIP category
    const category = cipCode.substring(0, 2);
    return programNames[category] || 'Other Programs';
  }
}

// Export singleton instance
const collegeScorecardService = new CollegeScorecardService();
export default collegeScorecardService;