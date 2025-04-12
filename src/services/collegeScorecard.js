// src/services/collegeScorecard.js - Updated to remove local calculations
import axios from 'axios';

const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

/**
 * Service to interact with the College Scorecard API
 */
class CollegeScorecardService {
  constructor() {
    this.apiKey = process.env.REACT_APP_SCORECARD_API_KEY || '';
    this.cache = new Map();
    this.cacheExpiration = 30 * 60 * 1000; // 30 minutes
    this.lastRequest = null; // Store the last request URL
  }

  /**
   * Get universities with filtering options
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Universities data
   */
  async getUniversities(options = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      // Generate a cache key based on parameters
      const cacheKey = JSON.stringify(options);

      // Check if we have a valid cached response
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheExpiration) {
          this.lastRequest = cachedData.requestUrl;
          return cachedData.data;
        }
      }

      // Build the query parameters
      let params = {
        'api_key': this.apiKey,
        'page': options.page || 0,
        'per_page': options.perPage || 20,
        '_sort': 'school.name'
      };

      // Add requested fields
      if (options.fields) {
        params.fields = options.fields;
      } else {
        // Default fields to request if not specified
        params.fields = this._getFieldsParameter();
      }

      // Add name filter
      if (options.name) {
        params['school.name'] = options.name;
      }

      // Add state filter
      if (options.state) {
        params['school.state'] = options.state;
      }

      // Add institution type filter
      if (options.type) {
        if (options.type.toLowerCase() === 'public') {
          params['school.ownership'] = 1;
        } else if (options.type.toLowerCase() === 'private') {
          params['school.ownership'] = 2;
        }
      }

      // Add any additional parameters directly
      Object.keys(options).forEach(key => {
        if (!['name', 'state', 'type', 'page', 'perPage', 'fields'].includes(key)) {
          params[key] = options[key];
        }
      });

      // Build request URL for debugging
      const url = new URL(BASE_URL);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      this.lastRequest = url.toString();

      // Make the API request
      const response = await axios.get(BASE_URL, { params });

      // Transform universities to a simplified format but keep all data
      const transformedData = {
        metadata: response.data.metadata,
        universities: response.data.results.map(college => this._transformUniversityItem(college))
      };

      // Cache the response
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
        requestUrl: this.lastRequest
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
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

      const cacheKey = `university_${id}`;

      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cachedData = this.cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp < this.cacheExpiration) {
          this.lastRequest = cachedData.requestUrl;
          return cachedData.data;
        }
      }

      // Build the request URL
      const url = `${BASE_URL}/${id}?api_key=${this.apiKey}&fields=${this._getFieldsParameter(true)}`;
      this.lastRequest = url;

      const response = await axios.get(url);

      // Preserve original data while maintaining our application's structure
      const university = this._transformUniversityDetail(response.data.results[0]);

      // Cache the result
      this.cache.set(cacheKey, {
        data: university,
        timestamp: Date.now(),
        requestUrl: url
      });

      return university;

    } catch (error) {
      console.error(`Error fetching university with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the last API request URL
   * @returns {string|null} - Last request URL
   */
  getLastRequest() {
    return this.lastRequest;
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
      'latest.cost.tuition.out_of_state',
      'school.price_calculator_url',
      'school.institutional_characteristics.level',
      'school.minority_serving.historically_black',
      'school.carnegie_basic',
      'latest.student.demographics.race_ethnicity',
      'latest.student.demographics.men',
      'latest.student.demographics.women',
      'latest.student.demographics.age_entry_over_25',
      'latest.student.demographics.first_generation',
      'latest.student.retention_rate.four_year.full_time',
      'latest.earnings.6_yrs_after_entry.median',
      'latest.earnings.10_yrs_after_entry.median'
    ];

    if (detailed) {
      return [
        ...baseFields,
        'school.locale',
        'school.degrees_awarded.predominant',
        'latest.admissions.admission_rate.by_ope_id',
        'latest.admissions.sat_scores.midpoint.critical_reading',
        'latest.admissions.sat_scores.midpoint.math',
        'latest.admissions.act_scores.25th_percentile.cumulative',
        'latest.admissions.act_scores.75th_percentile.cumulative',
        'latest.academics.program_percentage',
        'latest.completion.rate_suppressed.overall',
        'latest.aid.median_debt.completers.overall',
        'latest.student.part_time_share',
        'latest.student.enrollment.all'
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
      metadata: data.metadata,
      universities: data.results.map(college => this._transformUniversityItem(college))
    };
  }

  /**
   * Transform a university item while preserving original API data
   * @param {Object} college - College data from API
   * @returns {Object} - University object
   */
  _transformUniversityItem(college) {
    // Just restructure for convenience without local calculations
    return {
      id: college.id,
      name: college['school.name'] || 'Unnamed University',
      location: this._formatLocation(college),
      type: this._getInstitutionType(college['school.ownership']),
      acceptanceRate: college['latest.admissions.admission_rate.overall']
        ? Math.round(college['latest.admissions.admission_rate.overall'] * 100 * 10) / 10
        : null,
      satRange: {
        min: (college['latest.admissions.sat_scores.25th_percentile.critical_reading'] || 0) +
             (college['latest.admissions.sat_scores.25th_percentile.math'] || 0) || null,
        max: (college['latest.admissions.sat_scores.75th_percentile.critical_reading'] || 0) +
             (college['latest.admissions.sat_scores.75th_percentile.math'] || 0) || null
      },
      tuitionInState: college['latest.cost.tuition.in_state'] || null,
      tuitionOutState: college['latest.cost.tuition.out_of_state'] || null,
      website: college['school.school_url'] || null,
      level: this._formatLevel(college['school.institutional_characteristics.level']),
      isHBCU: college['school.minority_serving.historically_black'] || false,
      // Preserve all original API data
      _apiData: college
    };
  }

  /**
   * Format location from city and state
   * @param {Object} college - College data
   * @returns {string} - Formatted location
   */
  _formatLocation(college) {
    const city = college['school.city'] || '';
    const state = college['school.state'] || '';
    return city && state ? `${city}, ${state}` : (city || state || 'United States');
  }

  /**
   * Get institution type based on ownership code
   * @param {number} ownership - Ownership code
   * @returns {string} - Institution type
   */
  _getInstitutionType(ownership) {
    switch(ownership) {
      case 1: return 'Public';
      case 2: return 'Private';
      default: return 'Unknown';
    }
  }

  /**
   * Transform detailed university data
   * @param {Object} college - College detail from API
   * @returns {Object} - University detail object
   */
  _transformUniversityDetail(college) {
    // Get the base transformation
    const university = this._transformUniversityItem(college);

    // Add a few additional fields for convenience but keep it simple
    return {
      ...university,
      topPrograms: this._getTopPrograms(college),
      demographics: {
        raceEthnicity: college['latest.student.demographics.race_ethnicity'] || {},
        men: college['latest.student.demographics.men'] || null,
        women: college['latest.student.demographics.women'] || null,
        ageOver25: college['latest.student.demographics.age_entry_over_25'] || null,
        firstGeneration: college['latest.student.demographics.first_generation'] || null
      },
      earnings: {
        sixYears: college['latest.earnings.6_yrs_after_entry.median'] || null,
        tenYears: college['latest.earnings.10_yrs_after_entry.median'] || null
      },
      retention: college['latest.student.retention_rate.four_year.full_time'] || null,
      completion: college['latest.completion.rate_suppressed.overall'] || null
    };
  }

  /**
   * Format institution level
   * @param {number} level - Institution level code
   * @returns {string} - Formatted level
   */
  _formatLevel(level) {
    if (!level) return null;

    switch(level) {
      case 1: return '4-year';
      case 2: return '2-year';
      case 3: return 'Less than 2-year';
      default: return null;
    }
  }

  /**
   * Get top programs from program percentages
   * @param {Object} college - College data
   * @returns {Array} - Top programs
   */
  _getTopPrograms(college) {
    if (!college['latest.academics.program_percentage']) {
      return [];
    }

    return Object.entries(college['latest.academics.program_percentage'])
      .filter(([_, percentage]) => percentage > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([program, _]) => this._formatProgramName(program));
  }

  /**
   * Format program CIP code to readable name
   * @param {string} cipCode - CIP code from API
   * @returns {string} - Human-readable program name
   */
  _formatProgramName(cipCode) {
    // Map of CIP codes to readable names
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