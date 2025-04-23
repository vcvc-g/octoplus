// src/pages/ApiDebugPage.jsx - Enhanced to support test scores and better searching
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
  const [cityName, setCityName] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(0); // API uses 0-based indexing
  const [perPage, setPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  // Flexible function to fetch schools with test score information
  const fetchSchoolsWithTestScores = async () => {
    if (!isConfigured) {
      setError('API key is not configured. Add REACT_APP_SCORECARD_API_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build options using form inputs
      const options = {
        // Pagination parameters
        'page': parseInt(page),
        'per_page': parseInt(perPage),

        // Sorting by student size in descending order
        '_sort': 'latest.student.size:desc',

        // Fields to include in the response
        'fields': [
          // Basic institution information
          'id',
          'school.name',
          'school.city',
          'school.state',
          'school.zip',
          'school.school_url',
          'school.ownership',

          // SAT scores
          'latest.admissions.sat_scores.25th_percentile.critical_reading',
          'latest.admissions.sat_scores.75th_percentile.critical_reading',
          'latest.admissions.sat_scores.25th_percentile.math',
          'latest.admissions.sat_scores.75th_percentile.math',
          'latest.admissions.sat_scores.25th_percentile.writing',
          'latest.admissions.sat_scores.75th_percentile.writing',
          'latest.admissions.sat_scores.midpoint.critical_reading',
          'latest.admissions.sat_scores.midpoint.math',
          'latest.admissions.sat_scores.midpoint.writing',

          // ACT scores
          'latest.admissions.act_scores.25th_percentile.cumulative',
          'latest.admissions.act_scores.75th_percentile.cumulative',
          'latest.admissions.act_scores.25th_percentile.english',
          'latest.admissions.act_scores.75th_percentile.english',
          'latest.admissions.act_scores.25th_percentile.math',
          'latest.admissions.act_scores.75th_percentile.math',
          'latest.admissions.act_scores.25th_percentile.writing',
          'latest.admissions.act_scores.75th_percentile.writing',
          'latest.admissions.act_scores.midpoint.cumulative',
          'latest.admissions.act_scores.midpoint.english',
          'latest.admissions.act_scores.midpoint.math',
          'latest.admissions.act_scores.midpoint.writing',

          // Additional useful context
          'latest.admissions.admission_rate.overall',
          'latest.student.size'
        ].join(',')
      };

      // Add search term (institution name) filter if provided
      if (searchTerm && searchTerm.trim() !== '') {
        options['school.name'] = searchTerm;
      }

      // Add state filter if provided
      if (state && state.trim() !== '') {
        options['school.state'] = state.toUpperCase();
      }

      // Add city filter if provided
      if (cityName && cityName.trim() !== '') {
        options['school.city'] = cityName;
      }

      // Add institution type filter if selected
      if (type) {
        if (type.toLowerCase() === 'public') {
          options['school.ownership'] = 1;
        } else if (type.toLowerCase() === 'private') {
          options['school.ownership'] = 2;
        }
      }

      console.log('Making API request with options:', options);

      const response = await collegeScorecardService.getUniversities(options);
      setRawResponse(response);
      setProcessedData(response.universities);

      // Get the API request URL
      const requestUrl = collegeScorecardService.getLastRequest();
      setApiRequestUrl(requestUrl);

      // Update UI with pagination information
      if (response.metadata) {
        setTotalItems(response.metadata.total);
        setTotalPages(Math.ceil(response.metadata.total / response.metadata.per_page));
      }

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

      case 'testScores':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-300">SAT & ACT Scores</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SAT Scores Section */}
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-3 text-blue-200 border-b border-gray-700 pb-2">SAT Scores</h4>

                <div className="space-y-4">
                  {/* Reading Section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Critical Reading</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.75th_percentile.critical_reading'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.midpoint.critical_reading'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'] &&
                       apiData['latest.admissions.sat_scores.75th_percentile.critical_reading'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-blue-600 rounded"
                            style={{
                              left: `${Math.max(0, apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'] / 8)}%`,
                              width: `${(apiData['latest.admissions.sat_scores.75th_percentile.critical_reading'] -
                                        apiData['latest.admissions.sat_scores.25th_percentile.critical_reading']) / 8}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Math Section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Math</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.25th_percentile.math'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.75th_percentile.math'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.midpoint.math'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.sat_scores.25th_percentile.math'] &&
                       apiData['latest.admissions.sat_scores.75th_percentile.math'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-blue-600 rounded"
                            style={{
                              left: `${Math.max(0, apiData['latest.admissions.sat_scores.25th_percentile.math'] / 8)}%`,
                              width: `${(apiData['latest.admissions.sat_scores.75th_percentile.math'] -
                                        apiData['latest.admissions.sat_scores.25th_percentile.math']) / 8}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

{/* Writing Section */}
<div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Writing</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.25th_percentile.writing'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.75th_percentile.writing'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.sat_scores.midpoint.writing'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.sat_scores.25th_percentile.writing'] &&
                       apiData['latest.admissions.sat_scores.75th_percentile.writing'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-blue-600 rounded"
                            style={{
                              left: `${Math.max(0, apiData['latest.admissions.sat_scores.25th_percentile.writing'] / 8)}%`,
                              width: `${(apiData['latest.admissions.sat_scores.75th_percentile.writing'] -
                                        apiData['latest.admissions.sat_scores.25th_percentile.writing']) / 8}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACT Scores Section */}
              <div className="bg-gray-800 p-4 rounded shadow">
                <h4 className="font-medium mb-3 text-blue-200 border-b border-gray-700 pb-2">ACT Scores</h4>

                <div className="space-y-4">
                  {/* Cumulative Section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Cumulative</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.25th_percentile.cumulative'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.75th_percentile.cumulative'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.midpoint.cumulative'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.act_scores.25th_percentile.cumulative'] &&
                       apiData['latest.admissions.act_scores.75th_percentile.cumulative'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-green-600 rounded"
                            style={{
                              left: `${apiData['latest.admissions.act_scores.25th_percentile.cumulative'] * 3}%`,
                              width: `${(apiData['latest.admissions.act_scores.75th_percentile.cumulative'] -
                                        apiData['latest.admissions.act_scores.25th_percentile.cumulative']) * 3}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* English Section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">English</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.25th_percentile.english'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.75th_percentile.english'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.midpoint.english'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.act_scores.25th_percentile.english'] &&
                       apiData['latest.admissions.act_scores.75th_percentile.english'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-green-600 rounded"
                            style={{
                              left: `${apiData['latest.admissions.act_scores.25th_percentile.english'] * 3}%`,
                              width: `${(apiData['latest.admissions.act_scores.75th_percentile.english'] -
                                        apiData['latest.admissions.act_scores.25th_percentile.english']) * 3}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Math Section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Math</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>25th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.25th_percentile.math'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>75th Percentile:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.75th_percentile.math'])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Midpoint:</span>
                        <span>{formatNumber(apiData['latest.admissions.act_scores.midpoint.math'])}</span>
                      </div>

                      {/* Visual bar for range */}
                      {apiData['latest.admissions.act_scores.25th_percentile.math'] &&
                       apiData['latest.admissions.act_scores.75th_percentile.math'] && (
                        <div className="relative h-4 bg-gray-700 rounded mt-1">
                          <div
                            className="absolute h-full bg-green-600 rounded"
                            style={{
                              left: `${apiData['latest.admissions.act_scores.25th_percentile.math'] * 3}%`,
                              width: `${(apiData['latest.admissions.act_scores.75th_percentile.math'] -
                                        apiData['latest.admissions.act_scores.25th_percentile.math']) * 3}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Display note if test scores are missing */}
            {!apiData['latest.admissions.sat_scores.25th_percentile.critical_reading'] &&
             !apiData['latest.admissions.act_scores.25th_percentile.cumulative'] && (
              <div className="mt-4 p-3 bg-gray-700 rounded text-center">
                <p className="text-sm text-gray-300">
                  No test score data available for this institution. Many schools have made standardized tests optional or do not report their data.
                </p>
              </div>
            )}
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
              placeholder="NY, CA, etc..."
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">City</label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
              placeholder="New York, Boston, etc..."
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

          <div>
            <label className="block text-sm text-gray-400 mb-1">Page Number</label>
            <input
              type="number"
              min="0"
              value={page}
              onChange={(e) => setPage(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Results Per Page</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100 (max)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={fetchSchoolsWithTestScores}
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

            {/* Optional: Clear all filters button */}
            <button
              onClick={() => {
                setSearchTerm('');
                setState('');
                setCityName('');
                setType('');
                setPage(0);
                setPerPage(20);
              }}
              className="px-4 py-2 rounded font-medium bg-gray-700 hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>

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

        {/* Pagination info display */}
        {!loading && totalItems > 0 && (
          <div className="mt-3 text-sm text-gray-400">
            Showing page {parseInt(page) + 1} of {totalPages} (Total results: {totalItems})
          </div>
        )}
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

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center my-4">
                      <div className="flex space-x-1">
                        {/* First page button */}
                        <button
                          onClick={() => setPage(0)}
                          disabled={page === 0}
                          className={`px-3 py-1 rounded text-sm ${
                            page === 0
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-600 text-white'
                          }`}
                        >
                          &laquo;
                        </button>

                        {/* Previous page button */}
                        <button
                          onClick={() => setPage(Math.max(0, page - 1))}
                          disabled={page === 0}
                          className={`px-3 py-1 rounded text-sm ${
                            page === 0
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-600 text-white'
                          }`}
                        >
                          &lsaquo;
                        </button>

                        {/* Generate page number buttons */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Calculate which page numbers to show
                          let pageNum;
                          if (totalPages <= 5) {
                            // Show all pages if 5 or fewer
                            pageNum = i;
                          } else if (page < 2) {
                            // At the beginning
                            pageNum = i;
                          } else if (page > totalPages - 3) {
                            // At the end
                            pageNum = totalPages - 5 + i;
                          } else {
                            // In the middle
                            pageNum = page - 2 + i;
                          }

                          // Only render if pageNum is valid
                          if (pageNum >= 0 && pageNum < totalPages) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`px-3 py-1 rounded text-sm ${
                                  pageNum === page
                                    ? 'bg-blue-500 text-white font-medium'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                                }`}
                              >
                                {pageNum + 1}
                              </button>
                            );
                          }
                          return null;
                        })}

                        {/* Next page button */}
                        <button
                          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                          disabled={page === totalPages - 1}
                          className={`px-3 py-1 rounded text-sm ${
                            page === totalPages - 1
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-600 text-white'
                          }`}
                        >
                          &rsaquo;
                        </button>

                        {/* Last page button */}
                        <button
                          onClick={() => setPage(totalPages - 1)}
                          disabled={page === totalPages - 1}
                          className={`px-3 py-1 rounded text-sm ${
                            page === totalPages - 1
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-600 text-white'
                          }`}
                        >
                          &raquo;
                        </button>
                      </div>
                    </div>
                  )}
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
                    <button
                      className={`flex items-center px-4 py-2 ${
                        selectedTab === 'testScores'
                          ? 'bg-blue-800 border-b-2 border-blue-500'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedTab('testScores')}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      <span>Test Scores</span>
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