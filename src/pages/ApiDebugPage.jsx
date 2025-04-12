// src/pages/ApiDebugPage.jsx - Updated to display raw API data and request
import React, { useState, useEffect } from 'react';
import { BackgroundEffects } from '../components/ui';
import collegeScorecardService from '../services/collegeScorecard';
import { List, BookOpen, DollarSign, Users, GraduationCap, Award, BarChart } from 'lucide-react';

const ApiDebugPage = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [showRaw, setShowRaw] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedTab, setSelectedTab] = useState('admissions');
  const [apiRequestUrl, setApiRequestUrl] = useState('');

  // Query parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState('');
  const [minAcceptanceRate, setMinAcceptanceRate] = useState(0);
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState(100);
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Additional fields to request from the API
  const additionalFields = [
    // Admissions & Selectivity
    'latest.admissions.admission_rate.overall',
    'latest.admissions.admission_rate.by_gender',
    'latest.admissions.sat_scores',
    'latest.admissions.act_scores',
    'latest.admissions.applicants.total',
    'latest.admissions.applicants.men',
    'latest.admissions.applicants.women',
    'latest.admissions.admissions_yield',

    // Academics
    'latest.academics.program_percentage',
    'latest.academics.program_available',
    'latest.student.retention_rate',
    'latest.student.size',
    'latest.student.enrollment.undergrad_12_month',
    'latest.student.enrollment.grad_12_month',

    // Costs & Financial Aid
    'latest.cost.tuition',
    'latest.cost.avg_net_price',
    'latest.aid.federal_loan_rate',
    'latest.aid.median_debt',
    'latest.aid.loan_principal',
    'latest.aid.pell_grant_rate',

    // Demographics
    'latest.student.demographics',
    'latest.student.part_time_share',
    'latest.student.enrollment.all',

    // Outcomes
    'latest.earnings',
    'latest.completion',
    'latest.repayment.repayment_cohort',
    'latest.repayment.1_yr_repayment.overall'
  ];

  // Check if API key is configured
  useEffect(() => {
    const key = process.env.REACT_APP_SCORECARD_API_KEY;
    if (key && key !== 'your_api_key_here') {
      setApiKey(key);
      setIsConfigured(true);
    }
  }, []);

  // Function to fetch data from the API
  const fetchData = async () => {
    if (!isConfigured) {
      setError('API key is not configured. Add REACT_APP_SCORECARD_API_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options = {
        name: searchTerm,
        state: state,
        page: parseInt(page),
        perPage: parseInt(perPage),
        fields: additionalFields.join(',')
      };

      // Add acceptance rate range if values are changed from default
      if (minAcceptanceRate > 0 || maxAcceptanceRate < 100) {
        // The API expects this in the format of fieldname__range=min..max
        // And acceptance rates in the API are stored as decimals (0.0 to 1.0)
        options['latest.admissions.admission_rate.overall__range'] = `${minAcceptanceRate / 100}..${maxAcceptanceRate / 100}`;
      }

      // Set the institution type if selected
      if (type) {
        options.type = type;
      }

      const response = await collegeScorecardService.getUniversities(options);
      setRawResponse(response);
      setProcessedData(response.universities);

      // Get the API request URL
      const requestUrl = collegeScorecardService.getLastRequest();
      setApiRequestUrl(requestUrl);

      setSelectedUniversity(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Error fetching data: ${err.message}`);
      setLoading(false);
    }
  };

  // Format currency amounts
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return `$${amount.toLocaleString()}`;
  };

  // Format percentages
  const formatPercentage = (value) => {
    if (!value && value !== 0) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return num.toLocaleString();
  };

  // Get tab content based on selected tab and raw API data
  const getTabContent = () => {
    if (!selectedUniversity) return null;

    // Access the raw API data directly
    const apiData = selectedUniversity._apiData;

    switch (selectedTab) {
      case 'admissions':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">Admissions & Selectivity</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Acceptance Rates</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Acceptance Rate:</span>
                    <span className="font-semibold">{formatPercentage(apiData['latest.admissions.admission_rate.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Male Acceptance Rate:</span>
                    <span>{formatPercentage(apiData['latest.admissions.admission_rate.by_gender.men'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Female Acceptance Rate:</span>
                    <span>{formatPercentage(apiData['latest.admissions.admission_rate.by_gender.women'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admissions Yield:</span>
                    <span>{formatPercentage(apiData['latest.admissions.admissions_yield'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Applicants</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Applicants:</span>
                    <span className="font-semibold">{formatNumber(apiData['latest.admissions.applicants.total'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Male Applicants:</span>
                    <span>{formatNumber(apiData['latest.admissions.applicants.men'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Female Applicants:</span>
                    <span>{formatNumber(apiData['latest.admissions.applicants.women'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">SAT Scores</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>SAT Math (25th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.sat_scores.25th_percentile.math'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SAT Math (75th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.sat_scores.75th_percentile.math'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SAT Reading (25th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SAT Reading (75th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.sat_scores.75th_percentile.critical_reading'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">ACT Scores</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ACT Cumulative (25th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.act_scores.25th_percentile.cumulative'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ACT Cumulative (75th percentile):</span>
                    <span>{formatNumber(apiData['latest.admissions.act_scores.75th_percentile.cumulative'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ACT English (Midpoint):</span>
                    <span>{formatNumber(apiData['latest.admissions.act_scores.midpoint.english'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ACT Math (Midpoint):</span>
                    <span>{formatNumber(apiData['latest.admissions.act_scores.midpoint.math'])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academics':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">Academics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Programs & Majors</h4>
                <div className="space-y-2">
                  {apiData['latest.academics.program_percentage'] && Object.entries(apiData['latest.academics.program_percentage'])
                    .filter(([_, value]) => value > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 5)
                    .map(([program, percentage], index) => (
                      <div key={index} className="flex justify-between">
                        <span>{formatProgramName(program)}:</span>
                        <span>{formatPercentage(percentage)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Retention & Completion</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>First-year Retention Rate:</span>
                    <span className="font-semibold">{formatPercentage(apiData['latest.student.retention_rate.four_year.full_time'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graduation Rate (150% normal time):</span>
                    <span>{formatPercentage(apiData['latest.completion.rate_suppressed.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Rate:</span>
                    <span>{formatPercentage(apiData['latest.completion.transfer_rate.4yr.full_time'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow md:col-span-2">
                <h4 className="font-medium mb-2 text-blue-200">Student Body Size</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Enrollment:</span>
                    <span className="font-semibold">{formatNumber(apiData['latest.student.size'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Undergraduate Enrollment:</span>
                    <span>{formatNumber(apiData['latest.student.enrollment.undergrad_12_month'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graduate Enrollment:</span>
                    <span>{formatNumber(apiData['latest.student.enrollment.grad_12_month'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part-time Students:</span>
                    <span>{formatPercentage(apiData['latest.student.part_time_share'])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'costs':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">Costs & Financial Aid</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Tuition & Fees</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>In-state Tuition:</span>
                    <span className="font-semibold">{formatCurrency(apiData['latest.cost.tuition.in_state'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Out-of-state Tuition:</span>
                    <span>{formatCurrency(apiData['latest.cost.tuition.out_of_state'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Net Price:</span>
                    <span>{formatCurrency(apiData['latest.cost.avg_net_price.overall'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Financial Aid</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Federal Loan Rate:</span>
                    <span>{formatPercentage(apiData['latest.aid.federal_loan_rate'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pell Grant Rate:</span>
                    <span>{formatPercentage(apiData['latest.aid.pell_grant_rate'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow md:col-span-2">
                <h4 className="font-medium mb-2 text-blue-200">Student Debt</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Median Federal Debt:</span>
                    <span>{formatCurrency(apiData['latest.aid.median_debt.completers.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Loan Payment:</span>
                    <span>{formatCurrency(apiData['latest.aid.median_debt.completers.monthly_payments'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Loan Principal:</span>
                    <span>{formatCurrency(apiData['latest.aid.loan_principal'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loan Repayment Rate (1 year):</span>
                    <span>{formatPercentage(apiData['latest.repayment.1_yr_repayment.overall'])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">Student Demographics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Race/Ethnicity</h4>
                <div className="space-y-2">
                  {apiData['latest.student.demographics.race_ethnicity'] && Object.entries(apiData['latest.student.demographics.race_ethnicity'])
                    .filter(([key, value]) => value > 0 && !key.includes('unknown'))
                    .map(([race, percentage], index) => (
                      <div key={index} className="flex justify-between">
                        <span>{formatRaceEthnicity(race)}:</span>
                        <span>{formatPercentage(percentage)}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Gender</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Male Students:</span>
                    <span>{formatPercentage(apiData['latest.student.demographics.men'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Female Students:</span>
                    <span>{formatPercentage(apiData['latest.student.demographics.women'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow md:col-span-2">
                <h4 className="font-medium mb-2 text-blue-200">Other Demographics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Age 25+ Students:</span>
                    <span>{formatPercentage(apiData['latest.student.demographics.age_entry_over_25'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>First-generation Students:</span>
                    <span>{formatPercentage(apiData['latest.student.demographics.first_generation'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Part-time Students:</span>
                    <span>{formatPercentage(apiData['latest.student.part_time_share'])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'outcomes':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">Student Outcomes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Median Earnings (6 years after entry):</span>
                    <span>{formatCurrency(apiData['latest.earnings.6_yrs_after_entry.median'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Earnings (8 years after entry):</span>
                    <span>{formatCurrency(apiData['latest.earnings.8_yrs_after_entry.median'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Earnings (10 years after entry):</span>
                    <span className="font-semibold">{formatCurrency(apiData['latest.earnings.10_yrs_after_entry.median'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-2 text-blue-200">Completion & Retention</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Retention Rate:</span>
                    <span>{formatPercentage(apiData['latest.student.retention_rate.four_year.full_time'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion Rate (150% time):</span>
                    <span>{formatPercentage(apiData['latest.completion.rate_suppressed.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>4-year Graduation Rate:</span>
                    <span>{formatPercentage(apiData['latest.completion.rate_suppressed.four_year'])}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded shadow md:col-span-2">
                <h4 className="font-medium mb-2 text-blue-200">Loan Repayment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>1-year Repayment Rate:</span>
                    <span>{formatPercentage(apiData['latest.repayment.1_yr_repayment.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3-year Repayment Rate:</span>
                    <span>{formatPercentage(apiData['latest.repayment.3_yr_repayment.overall'])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>5-year Repayment Rate:</span>
                    <span>{formatPercentage(apiData['latest.repayment.5_yr_repayment.overall'])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Format program names from CIP codes
  const formatProgramName = (cipCode) => {
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
    return programNames[category] || cipCode;
  };

  // Format race/ethnicity names
  const formatRaceEthnicity = (key) => {
    const raceMap = {
      'white': 'White',
      'black': 'Black',
      'hispanic': 'Hispanic/Latino',
      'asian': 'Asian',
      'aian': 'American Indian/Alaska Native',
      'nhpi': 'Native Hawaiian/Pacific Islander',
      'two_or_more': 'Two or More Races',
      'non_resident_alien': 'Non-Resident Alien'
    };

    return raceMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <BackgroundEffects animateBackground={true} />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 shadow-lg relative z-10">
        <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse"></div>
        <h1 className="text-2xl font-bold relative">
          University Explorer - API Debug
          <span className="absolute -bottom-1 left-0 w-1/2 h-1 bg-blue-400 rounded-full"></span>
        </h1>

        <div className="mt-2 flex items-center">
          <span className="mr-2">API Status:</span>
          {isConfigured ? (
            <span className="bg-green-600 px-2 py-1 rounded text-xs">
              Configured: {apiKey.substring(0, 4)}...{apiKey.substring(apiKey.length - 4)}
            </span>
          ) : (
            <span className="bg-red-600 px-2 py-1 rounded text-xs">
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* API Request URL display */}
      {apiRequestUrl && (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-medium text-gray-300">API Request:</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(apiRequestUrl);
                alert('API URL copied to clipboard!');
              }}
              className="px-2 py-1 bg-blue-700 text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Copy URL
            </button>
          </div>
          <div className="overflow-x-auto bg-gray-900 p-2 rounded border border-gray-700">
            <code className="text-xs text-green-400 break-all whitespace-pre-wrap">{apiRequestUrl}</code>
          </div>
        </div>
      )}

      {/* Query options */}
      <div className="bg-gray-800 p-4 border-b border-gray-700 relative z-10">
        <h2 className="text-lg font-semibold mb-3">Search for Universities</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">University Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              placeholder="Search by name..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">State (2-letter code)</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              placeholder="CA, NY, etc..."
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Institution Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="">All Types</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Acceptance Rate Range: {minAcceptanceRate}% - {maxAcceptanceRate}%</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={minAcceptanceRate}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMinAcceptanceRate(val > maxAcceptanceRate ? maxAcceptanceRate : val);
                }}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={maxAcceptanceRate}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setMaxAcceptanceRate(val < minAcceptanceRate ? minAcceptanceRate : val);
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Results Per Page</label>
              <select
                value={perPage}
                onChange={(e) => setPerPage(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={fetchData}
            disabled={loading || !isConfigured}
            className={`px-4 py-2 rounded font-medium ${
              !isConfigured
                ? 'bg-gray-600 cursor-not-allowed'
                : loading
                  ? 'bg-blue-800 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {loading ? 'Loading...' : 'Search Universities'}
          </button>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showRaw}
              onChange={() => setShowRaw(!showRaw)}
              className="mr-2"
            />
            <span>Show Raw API Response</span>
          </label>
        </div>
      </div>

      {/* Results section */}
      <div className="flex-1 overflow-auto relative z-10">
        {error && (
          <div className="m-4 p-3 bg-red-900/50 border border-red-700 rounded">
            <h3 className="text-red-400 font-medium mb-1">Error</h3>
            <p className="text-sm">{error}</p>
            {!isConfigured && (
              <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                <p>To configure the API:</p>
                <ol className="list-decimal list-inside mt-1">
                  <li className="mb-1">Create a .env file in the project root</li>
                  <li className="mb-1">Add your College Scorecard API key: REACT_APP_SCORECARD_API_KEY=your_key_here</li>
                  <li>Restart the application</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* List of universities */}
            <div className={`${selectedUniversity ? 'w-1/3' : 'w-full'} p-4 overflow-y-auto border-r border-gray-700`}>
              {processedData.length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-green-900/30 border border-green-700/50 rounded">
                    <h3 className="text-green-400 font-medium mb-1">Search Results</h3>
                    <p className="text-sm">
                      Found {rawResponse.metadata.total} universities (showing page {rawResponse.metadata.page + 1})
                    </p>
                  </div>

                  {/* University list */}
                  <div className="space-y-3">
                    {processedData.map((university, index) => (
                      <div
                        key={university.id}
                        className={`p-3 rounded border transition-colors cursor-pointer ${
                          selectedUniversity?.id === university.id
                            ? 'bg-blue-800 border-blue-600'
                            : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedUniversity(university)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium">{university.name}</h4>
                          <span className="text-sm px-2 py-0.5 bg-blue-900 rounded">
                            Result #{index + 1}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                          <span>{university.location}</span>
                          <span>{university.type}</span>
                          <span>
                            {university.acceptanceRate
                              ? `${university.acceptanceRate}% acceptance`
                              : 'Acceptance rate unknown'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : !loading && !error ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No universities found matching your search criteria.</p>
                  <p className="mt-2 text-sm">Try adjusting your filters or search term.</p>
                </div>
              ) : null}

              {/* Raw JSON view if enabled */}
              {showRaw && rawResponse && (
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                  <h3 className="text-blue-400 font-medium mb-2 flex items-center">
                    <List className="w-4 h-4 mr-2" />
                    Raw API Response
                  </h3>
                  <pre className="text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* University detail view */}
            {selectedUniversity && (
              <div className="w-2/3 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  {/* University header */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center font-bold text-lg">
                        {selectedUniversity._apiData?.['school.carnegie_basic'] || '?'}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedUniversity.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-blue-700/50 rounded text-sm">{selectedUniversity.location}</span>
                          <span className="px-2 py-0.5 bg-purple-700/50 rounded text-sm">{selectedUniversity.type}</span>
                          {selectedUniversity.acceptanceRate && (
                            <span className="px-2 py-0.5 bg-green-700/50 rounded text-sm">
                              {selectedUniversity.acceptanceRate}% acceptance rate
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation tabs */}
                  <div className="flex border-b border-gray-700">
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'admissions'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('admissions')}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      <span>Admissions</span>
                    </button>
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'academics'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('academics')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>Academics</span>
                    </button>
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'costs'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('costs')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>Costs</span>
                    </button>
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'demographics'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('demographics')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      <span>Demographics</span>
                    </button>
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'outcomes'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('outcomes')}
                    >
                      <BarChart className="w-4 h-4 mr-2" />
                      <span>Outcomes</span>
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="p-4">
                    {getTabContent()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDebugPage;