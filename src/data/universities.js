export const universities = [
  {
    id: 1,
    name: "Massachusetts Institute of Technology (MIT)",
    location: "United States",
    type: "Private",
    qsRank: 1,
    acceptanceRate: 4.1,
    satRange: { min: 1510, max: 1580 },
    gpaCutoff: 4.17,
    description: "MIT is a world-renowned science and technology research university known for its rigorous academic programs and innovation.",
    topPrograms: ["Computer Science", "Engineering", "Physics", "Mathematics", "Business"],
    requirements: "Common App, SAT/ACT, 2 SAT Subject Tests (recommended), Essays, 2 Teacher Recommendations"
  },
  {
    id: 2,
    name: "University of Cambridge",
    location: "United Kingdom",
    type: "Public",
    qsRank: 2,
    acceptanceRate: 21,
    satRange: { min: 1460, max: 1570 },
    gpaCutoff: 3.9,
    description: "Cambridge is one of the world's oldest universities and leading academic centers, known for its traditional collegiate system.",
    topPrograms: ["Mathematics", "Natural Sciences", "Engineering", "Law", "Economics"],
    requirements: "UCAS Application, Personal Statement, Academic Transcripts, Entrance Exams (subject-specific), Interviews"
  },
  {
    id: 3,
    name: "Stanford University",
    location: "United States",
    type: "Private",
    qsRank: 3,
    acceptanceRate: 4.3,
    satRange: { min: 1470, max: 1570 },
    gpaCutoff: 3.96,
    description: "Stanford is a private research university known for its academic strength, entrepreneurial character, and proximity to Silicon Valley.",
    topPrograms: ["Computer Science", "Engineering", "Business", "Environmental Science", "Psychology"],
    requirements: "Common App, SAT/ACT (optional), Essays, 2 Teacher Recommendations, School Report"
  },
  {
    id: 4,
    name: "University of Oxford",
    location: "United Kingdom",
    type: "Public",
    qsRank: 4,
    acceptanceRate: 17.5,
    satRange: { min: 1470, max: 1560 },
    gpaCutoff: 3.9,
    description: "Oxford is the world's second-oldest university in continuous operation and is renowned for its teaching and research in the humanities.",
    topPrograms: ["Humanities", "Social Sciences", "Mathematics", "Medicine", "Law"],
    requirements: "UCAS Application, Personal Statement, Academic Transcripts, Entrance Tests, Interviews"
  },
  {
    id: 5,
    name: "Harvard University",
    location: "United States",
    type: "Private",
    qsRank: 5,
    acceptanceRate: 3.4,
    satRange: { min: 1460, max: 1580 },
    gpaCutoff: 4.18,
    description: "Harvard is a private Ivy League research university with a history, influence, and wealth that has made it one of the most prestigious universities in the world.",
    topPrograms: ["Economics", "Political Science", "Biology", "Mathematics", "History"],
    requirements: "Common App, SAT/ACT (optional), Essays, Teacher Recommendations, School Report, Interview (if invited)"
  },
  {
    id: 6,
    name: "California Institute of Technology (Caltech)",
    location: "United States",
    type: "Private",
    qsRank: 6,
    acceptanceRate: 6.4,
    satRange: { min: 1530, max: 1590 },
    gpaCutoff: 4.19,
    description: "Caltech is a world-renowned science and engineering research and education institution where extraordinary faculty and students seek answers to complex questions.",
    topPrograms: ["Physics", "Astronomy", "Engineering", "Chemistry", "Computer Science"],
    requirements: "Common App, SAT/ACT (optional), 2 Teacher Recommendations (STEM), 1 Humanities/Social Sciences Recommendation"
  },
  {
    id: 7,
    name: "Imperial College London",
    location: "United Kingdom",
    type: "Public",
    qsRank: 7,
    acceptanceRate: 14.3,
    satRange: { min: 1440, max: 1540 },
    gpaCutoff: 3.7,
    description: "Imperial focuses exclusively on science, engineering, medicine, and business and is renowned for its high-impact research and innovation.",
    topPrograms: ["Engineering", "Medicine", "Natural Sciences", "Business", "Computing"],
    requirements: "UCAS Application, Personal Statement, Academic Transcripts, English Language Proficiency Tests"
  },
  {
    id: 8,
    name: "ETH Zurich",
    location: "Switzerland",
    type: "Public",
    qsRank: 8,
    acceptanceRate: 27,
    satRange: { min: 1400, max: 1520 },
    gpaCutoff: 3.6,
    description: "ETH Zurich is a public research university with a focus on science, technology, engineering, and mathematics, consistently ranked among the top universities in the world.",
    topPrograms: ["Engineering", "Computer Science", "Architecture", "Natural Sciences", "Mathematics"],
    requirements: "High School Diploma, Entrance Examination (depending on country of origin), Language Proficiency (German/English)"
  },
  {
    id: 9,
    name: "University of Chicago",
    location: "United States",
    type: "Private",
    qsRank: 9,
    acceptanceRate: 5.9,
    satRange: { min: 1500, max: 1570 },
    gpaCutoff: 4.0,
    description: "UChicago is a private research university known for its rigorous academic programs, strong emphasis on critical thinking, and interdisciplinary approach.",
    topPrograms: ["Economics", "Political Science", "Mathematics", "Physics", "Business"],
    requirements: "Common App, SAT/ACT (optional), 2 Teacher Recommendations, School Report, Optional Video Introduction"
  },
  {
    id: 10,
    name: "University College London (UCL)",
    location: "United Kingdom",
    type: "Public",
    qsRank: 10,
    acceptanceRate: 63,
    satRange: { min: 1390, max: 1510 },
    gpaCutoff: 3.3,
    description: "UCL is a public research university located in London and a member of the prestigious Russell Group of British research universities.",
    topPrograms: ["Architecture", "Anthropology", "Medicine", "Law", "Geography"],
    requirements: "UCAS Application, Personal Statement, Academic Transcripts, English Language Proficiency Tests"
  },
  {
    id: 11,
    name: "National University of Singapore (NUS)",
    location: "Singapore",
    type: "Public",
    qsRank: 11,
    acceptanceRate: 5,
    satRange: { min: 1450, max: 1550 },
    gpaCutoff: 3.8,
    description: "NUS is Singapore's flagship university providing a global approach to education and research with a focus on Asian perspectives and expertise.",
    topPrograms: ["Computer Science", "Business", "Engineering", "Medicine", "Social Sciences"],
    requirements: "Application Form, Academic Transcripts, Personal Statement, SAT/ACT (for international students)"
  },
  {
    id: 12,
    name: "Princeton University",
    location: "United States",
    type: "Private",
    qsRank: 12,
    acceptanceRate: 4.4,
    satRange: { min: 1450, max: 1570 },
    gpaCutoff: 3.9,
    description: "Princeton is a private Ivy League research university with a strong focus on undergraduate education and generous financial aid.",
    topPrograms: ["Economics", "Public Policy", "Engineering", "Computer Science", "Molecular Biology"],
    requirements: "Common App, SAT/ACT (optional), Graded Written Paper, 2 Teacher Recommendations, School Report"
  }
];