
import fs from 'fs';
import path from 'path';

/**
 * Creates shell scripts in the dist directory
 * @param {string} distPath - The path to the dist directory
 */
export function createScripts(distPath) {
  // Create start.sh script with improved error handling
  console.log('Creating start.sh script...');
  const startScriptContent = `#!/bin/bash
# This script handles starting the server in production

# Don't exit on error - we want to try fallbacks
set +e

echo "Starting deployment script $(date)"

# Force npm to use install instead of ci
export NPM_CONFIG_CI=false 
export NPM_CONFIG_LEGACY_PEER_DEPS=true

echo "Checking for package-lock.json"
# Remove any lock file to prevent npm ci
if [ -f "package-lock.json" ]; then
  echo "Removing existing package-lock.json"
  rm package-lock.json
fi

# Create a minimal package-lock.json
echo "Creating minimal package-lock.json"
echo '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}' > package-lock.json

echo "Checking for .npmrc"
# Create .npmrc if not exists
if [ ! -f ".npmrc" ]; then
  echo "Creating .npmrc file..."
  cat > .npmrc << EOF
ci=false
legacy-peer-deps=true
package-lock=false
prefer-offline=true
fund=false
audit=false
EOF
fi

echo "Checking for dependencies"
# Install dependencies if they haven't been installed yet
if [ ! -d "node_modules" ] || [ ! -d "node_modules/express" ]; then
  echo "Installing dependencies..."
  npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps express compression || true
fi

# Start the server with fallbacks
echo "Starting server..."
node server.js || node fallback-server.js || echo "Failed to start server" >&2
`;

  fs.writeFileSync(path.join(distPath, 'start.sh'), startScriptContent);

  // Make start.sh executable
  try {
    console.log('Making start.sh executable...');
    fs.chmodSync(path.join(distPath, 'start.sh'), '0755');
  } catch (error) {
    console.error('Failed to chmod start.sh, but continuing:', error);
  }

  // Create run.sh as another fallback
  console.log('Creating run.sh script...');
  const runScriptContent = `#!/bin/bash
# Fallback script to start server if the start.sh fails

# Don't exit on error - we want to try all options
set +e

echo "Running fallback script $(date)"

# Try using node directly if npm fails
node server.js || node fallback-server.js || echo "Failed to start server" >&2
`;

  fs.writeFileSync(path.join(distPath, 'run.sh'), runScriptContent);

  // Make run.sh executable
  try {
    console.log('Making run.sh executable...');
    fs.chmodSync(path.join(distPath, 'run.sh'), '0755');
  } catch (error) {
    console.error('Failed to chmod run.sh, but continuing:', error);
  }

  // Create Procfile in dist
  console.log('Creating Procfile in dist directory...');
  const procfileContent = 'web: bash -c "chmod +x start.sh && ./start.sh || node server.js || node fallback-server.js"';
  fs.writeFileSync(path.join(distPath, 'Procfile'), procfileContent);
}
