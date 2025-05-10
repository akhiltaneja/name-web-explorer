
#!/bin/bash

# Makes the script exit if any command fails
set -e

# Print each command before executing it
set -x

echo "========== STARTING CUSTOM BUILD PROCESS =========="

# Set environment variables to force npm install
export NPM_CONFIG_CI=false
export NPM_CONFIG_LEGACY_PEER_DEPS=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Remove any existing package-lock.json to prevent npm ci
if [ -f "package-lock.json" ]; then
  echo "Removing package-lock.json to prevent npm ci"
  rm package-lock.json
fi

# Create a minimal package-lock.json that won't trigger npm ci
echo '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}' > package-lock.json

echo "Installing dependencies with npm install..."
npm install --legacy-peer-deps --no-fund --no-audit

echo "Building application..."
npm run build

echo "Running post-build operations..."
node scripts/post-build.js

echo "Build completed successfully!"
