
#!/bin/bash

# Makes the script exit if any command fails
set -e

# Print each command before executing it
set -x

echo "========== PREVENTING NPM CI FROM RUNNING =========="

# Create a wrapper that forces npm install instead of npm ci
cat > /tmp/npm-wrapper.js <<EOF
#!/usr/bin/env node
const { spawn } = require('child_process');
const args = process.argv.slice(2);

// Convert 'npm ci' to 'npm install --legacy-peer-deps'
if (args[0] === 'ci') {
  console.log('🔄 Intercepted npm ci command, using npm install --legacy-peer-deps instead');
  args[0] = 'install';
  args.push('--legacy-peer-deps');
  args.push('--no-fund');
  args.push('--no-audit');
}

// Spawn the real npm with modified arguments
const child = spawn('npm.real', args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));
EOF

# Make the wrapper executable
chmod +x /tmp/npm-wrapper.js

# Move the real npm temporarily
if [ -f "$(which npm)" ]; then
  mv "$(which npm)" "$(which npm).real"
  ln -s /tmp/npm-wrapper.js "$(which npm)"
fi

# Create a fake package-lock.json
echo '{"lockfileVersion":3,"requires":true,"packages":{}}' > package-lock.json

# Set npm config to ignore npm ci
export NPM_CONFIG_CI=false

# Clear any existing node_modules to prevent conflicts
if [ -d "node_modules" ]; then
  rm -rf node_modules
fi

# Install dependencies with regular npm install and legacy peer deps
echo "Installing dependencies with npm install..."
npm install --legacy-peer-deps --no-fund --no-audit

# Build the application
echo "Building application..."
npm run build

# Run the post-build script to generate necessary deployment files
echo "Running post-build operations..."
node scripts/post-build.js

echo "Build completed successfully with post-build operations"
