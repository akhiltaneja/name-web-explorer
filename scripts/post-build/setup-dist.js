
import fs from 'fs';

/**
 * Ensures the dist directory exists
 * @param {string} distPath - The path to the dist directory
 */
export function setupDistDirectory(distPath) {
  console.log('Checking dist directory...');
  
  // Ensure the dist directory exists
  if (!fs.existsSync(distPath)) {
    console.log('Creating dist directory...');
    fs.mkdirSync(distPath, { recursive: true });
  } else {
    console.log('Dist directory exists, continuing...');
  }
}
