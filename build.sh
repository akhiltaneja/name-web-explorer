
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

# Make sure .npmrc exists with the right settings
cat > .npmrc << EOF
# Force npm to use install instead of ci
ci=false

# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Set timeout for network operations
network-timeout=600000

# Prevent the generation of package-lock.json during CI
package-lock=false

# Decrease logging verbosity
loglevel=error

# Additional options to prevent npm ci
prefer-offline=true
fund=false
audit=false
EOF

echo "Installing dependencies with npm install..."
npm install --legacy-peer-deps --no-fund --no-audit

echo "Building application..."
npm run build

echo "Running post-build operations..."
node scripts/post-build.js

echo "Build completed successfully!"
