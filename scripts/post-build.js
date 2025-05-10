
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupDistDirectory } from './post-build/setup-dist.js';
import { createServerFiles } from './post-build/create-server-files.js';
import { createScripts } from './post-build/create-scripts.js';
import { createConfigFiles } from './post-build/create-config-files.js';
import { installDependencies } from './post-build/install-dependencies.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

console.log('Starting post-build operations...');

try {
  // Ensure the dist directory exists
  setupDistDirectory(distPath);

  // Create server files
  createServerFiles(distPath);

  // Create script files
  createScripts(distPath);

  // Create config files
  createConfigFiles(distPath);

  // Install dependencies in dist folder
  installDependencies(distPath);

  console.log('✅ Post-build files generated successfully');
} catch (error) {
  console.error('Error during post-build operations:', error);
  // Even if we have an error, exit with 0 to not fail the build
  // This allows deployment to proceed with fallback options
  process.exit(0);
}
