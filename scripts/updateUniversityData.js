// scripts/updateUniversityData.js
import { enrichUniversityData } from '../src/utils/dataEnrichment';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateAll() {
  console.log('Updating university data from College Scorecard API...');

  // Get the absolute paths to the JSON files
//   const qsPath = path.resolve(__dirname, '../src/data/qs100.json');
  const usnewsPath = path.resolve(__dirname, '../src/data/usnewsTop100.json');

  // Update both datasets
//   await enrichUniversityData(qsPath);
  await enrichUniversityData(usnewsPath);

  console.log('Update complete!');
}

updateAll().catch(error => {
  console.error('Update failed:', error);
  process.exit(1);
});