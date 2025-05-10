
#!/bin/bash

# Force npm to use regular install and prevent npm ci
echo "Starting build with npm install instead of npm ci"
export NPM_CONFIG_CI=false

# Install dependencies with regular npm install and legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps --no-fund --no-audit

# Build the application
echo "Building application..."
npm run build

# Run the post-build script to generate necessary deployment files
echo "Running post-build operations..."
node scripts/post-build.js

echo "Build completed successfully with post-build operations"
