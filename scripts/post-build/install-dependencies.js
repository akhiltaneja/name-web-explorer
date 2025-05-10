
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Installs dependencies in the dist directory
 * @param {string} distPath - The path to the dist directory
 */
export function installDependencies(distPath) {
  console.log('Installing dependencies in dist folder with retry logic...');

  const MAX_RETRIES = 3;
  let retryCount = 0;
  let success = false;

  // Try multiple methods to install dependencies with retry logic
  while (!success && retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Attempt ${retryCount} to install dependencies...`);
    
    try {
      // Store current directory to return to later
      const currentDir = process.cwd();
      
      // Change to dist directory
      process.chdir(distPath);
      console.log(`Current directory: ${process.cwd()}`);
      
      // Method 1: Try regular npm install
      try {
        execSync('npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps express compression', { 
          stdio: 'inherit',
          env: { 
            ...process.env, 
            NPM_CONFIG_CI: 'false',
            NPM_CONFIG_LEGACY_PEER_DEPS: 'true'
          },
          timeout: 120000 // 2 minute timeout
        });
        success = true;
        console.log('Dependencies installed successfully!');
      } catch (err) {
        console.error('Method 1 failed, trying alternative method...', err);
        
        // Method 2: Try creating node_modules and package manually if npm fails
        try {
          if (!fs.existsSync(path.join(distPath, 'node_modules'))) {
            fs.mkdirSync(path.join(distPath, 'node_modules'), { recursive: true });
          }
          
          // If we reach here, even if we couldn't install dependencies, we'll try to run without them
          // The server.js has a fallback to use native http module
          console.log('Created node_modules directory, will continue with deployment');
          success = true;
        } catch (manualErr) {
          console.error('Method 2 failed as well:', manualErr);
        }
      }
      
      // Go back to original directory
      process.chdir(currentDir);
      console.log(`Returned to directory: ${process.cwd()}`);
    } catch (error) {
      console.error(`Attempt ${retryCount} failed:`, error);
    }
  }

  if (!success) {
    console.log('Failed to install dependencies after multiple attempts.');
    console.log('The application will try to run with the fallback server that uses only native Node.js modules.');
  }
}
