// src/services/collegeScorecard.js - Enhanced to handle API data better
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
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

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
        '_sort': 'school.name'
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
      if (!this.apiKey) {
        throw new Error('API key not configured');
      }

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
      'latest.cost.tuition.out_of_state',
      'school.price_calculator_url',
      'school.institutional_characteristics.level',
      'school.minority_serving.historically_black'
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
        'latest.completion.rate_suppressed.overall',
        'latest.aid.median_debt.completers.overall',
        'latest.student.retention_rate.four_year.full_time'
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
    // Calculate rank approximation (based on admission rate and other factors)
    const admissionRate = college['latest.admissions.admission_rate.overall'] || 0.5;
    const hasCompleteSATData =
      college['latest.admissions.sat_scores.25th_percentile.math'] &&
      college['latest.admissions.sat_scores.75th_percentile.math'];

    let qsRank = Math.min(Math.round((1 - admissionRate) * 200), 400);

    // Adjust rank based on data completeness
    if (!hasCompleteSATData) {
      qsRank += 50; // Penalty for missing data
    }

    // Adjust for size of institution
    const studentSize = college['latest.student.size'] || 0;
    if (studentSize > 20000) qsRank -= 20;
    else if (studentSize > 10000) qsRank -= 10;

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

    // Format location
    const city = college['school.city'] || '';
    const state = college['school.state'] || '';
    const location = city && state ? `${city}, ${state}` : (city || state || 'United States');

    return {
      id: college.id,
      name: college['school.name'] || 'Unnamed University',
      location: location,
      type: type,
      qsRank: qsRank,
      acceptanceRate: admissionRate ? Math.round(admissionRate * 100 * 10) / 10 : null,
      satRange: {
        min: satMin || null,
        max: satMax || null
      },
      gpaCutoff: this._estimateGPACutoff(admissionRate, satMin),
      studentCount: college['latest.student.size'] || null,
      tuitionInState: college['latest.cost.tuition.in_state'] || null,
      tuitionOutState: college['latest.cost.tuition.out_of_state'] || null,
      website: college['school.school_url'] || null,
      level: this._formatLevel(college['school.institutional_characteristics.level']),
      isHBCU: college['school.minority_serving.historically_black'] || false
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

    // Calculate retention rate
    const retentionRate = college['latest.student.retention_rate.four_year.full_time']
      ? Math.round(college['latest.student.retention_rate.four_year.full_time'] * 100)
      : null;

    // Add more detailed data
    return {
      ...university,
      description: description,
      topPrograms: topPrograms.length > 0 ? topPrograms : null,
      completionRate: college['latest.completion.rate_suppressed.overall']
        ? Math.round(college['latest.completion.rate_suppressed.overall'] * 100)
        : null,
      medianEarnings: college['latest.earnings.10_yrs_after_entry.median'] || null,
      medianDebt: college['latest.aid.median_debt.completers.overall'] || null,
      retentionRate: retentionRate,
      requirements: this._generateRequirementsText(college),
      // Add demographics if available
      demographics: college['latest.student.demographics.race_ethnicity'] || null
    };
  }

  /**
   * Estimate GPA cutoff based on acceptance rate and SAT scores
   * @param {number} acceptanceRate - University acceptance rate
   * @param {number} satMin - Minimum SAT score
   * @returns {number} - Estimated GPA cutoff
   */
  _estimateGPACutoff(acceptanceRate, satMin) {
    if (!acceptanceRate) return 3.0;

    // Base GPA estimate on acceptance rate
    let gpaEstimate = 4.0 - (acceptanceRate * 1.5);

    // Adjust based on SAT if available
    if (satMin) {
      if (satMin > 1400) gpaEstimate += 0.2;
      else if (satMin < 1000) gpaEstimate -= 0.2;
    }

    // Keep in reasonable range
    return Math.max(2.5, Math.min(4.0, gpaEstimate)).toFixed(1);
  }

  /**
   * Format institution level
   * @param {number} level - Institution level code
   * @returns {string} - Formatted level
   */
  _formatLevel(level) {
    if (!level) return null;

    switch(level) {
      case 1:
        return '4-year';
      case 2:
        return '2-year';
      case 3:
        return 'Less than 2-year';
      default:
        return null;
    }
  }

  /**
   * Generate a descriptive paragraph about the university
   * @param {Object} college - College data
   * @returns {string} - Description text
   */
  _generateUniversityDescription(college) {
    const name = college['school.name'] || 'This university';
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

    const isHBCU = college['school.minority_serving.historically_black'];
    let hbcuText = isHBCU ? ' It is recognized as a Historically Black College and University (HBCU).' : '';

    // Build the description
    const city = college['school.city'] || '';
    const state = college['school.state'] || '';
    const location = city && state ? `${city}, ${state}` : (city || state || '');

    let description = `${name} is a ${sizeDesc} ${type} institution`;
    if (location) {
      description += ` located in ${location}`;
    }
    description += `.`;

    if (admissionRate) {
      description += ` It is a ${selectivity} university with an acceptance rate of ${Math.round(admissionRate * 100)}%.`;
    }

    if (size) {
      description += ` The university has approximately ${size.toLocaleString()} enrolled students.`;
    }

    description += hbcuText;

    return description;
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
    } else if (college['latest.admissions.sat_scores.25th_percentile.critical_reading'] &&
              college['latest.admissions.sat_scores.25th_percentile.math']) {
      const min = college['latest.admissions.sat_scores.25th_percentile.critical_reading'] +
                  college['latest.admissions.sat_scores.25th_percentile.math'];
      const max = college['latest.admissions.sat_scores.75th_percentile.critical_reading'] +
                  college['latest.admissions.sat_scores.75th_percentile.math'];
      requirements += `\n• SAT scores (range: ${min}-${max} combined)`;
    }

    if (act) {
      requirements += `\n• ACT scores (midpoint: ${act})`;
    } else if (college['latest.admissions.act_scores.25th_percentile.cumulative'] &&
              college['latest.admissions.act_scores.75th_percentile.cumulative']) {
      const min = college['latest.admissions.act_scores.25th_percentile.cumulative'];
      const max = college['latest.admissions.act_scores.75th_percentile.cumulative'];
      requirements += `\n• ACT scores (range: ${min}-${max})`;
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