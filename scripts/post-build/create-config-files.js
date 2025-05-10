
import fs from 'fs';
import path from 'path';

/**
 * Creates configuration files in the dist directory
 * @param {string} distPath - The path to the dist directory
 */
export function createConfigFiles(distPath) {
  // Create .npmrc in the dist folder
  console.log('Creating .npmrc in dist directory...');
  const npmrcContent = `
# Force npm to use install instead of ci
ci=false
ignore-scripts=false

# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Prevent npm ci
package-lock=false

# Additional options
prefer-offline=true
fund=false
audit=false
cache=false
update-notifier=false
`;
  fs.writeFileSync(path.join(distPath, '.npmrc'), npmrcContent);

  // Create package-lock.json in dist to prevent npm ci
  console.log('Creating package-lock.json in dist directory...');
  fs.writeFileSync(path.join(distPath, 'package-lock.json'), '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}');

  // Copy environment variables if any exist
  const envPath = path.join(path.dirname(distPath), '.env');
  if (fs.existsSync(envPath)) {
    console.log('Copying .env file to dist...');
    fs.copyFileSync(envPath, path.join(distPath, '.env'));
  }
}
