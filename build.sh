
#!/bin/bash

# Makes the script exit if any command fails
set -e

# Print each command before executing it
set -x

echo "========== STARTING CUSTOM BUILD PROCESS =========="

# Force npm to use install instead of ci
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
chmod 0644 package-lock.json

# Backup original .npmrc if it exists 
if [ -f ".npmrc" ]; then
  mv .npmrc .npmrc.bak
fi

# Create a strong .npmrc that disables ci
cat > .npmrc << EOF
# IMPORTANT: Force npm to use install instead of ci
ci=false
ignore-scripts=false

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
cache=false
update-notifier=false

# Make sure this is set at runtime
runtime=node
engine-strict=false
EOF

# Add custom npm config to force install directly
echo "Installing dependencies with npm install and skipping npm ci..."
npm config set ci false --location=project
npm config set package-lock false --location=project
npm install --no-audit --no-fund --legacy-peer-deps

echo "Building application..."
npm run build

echo "Running post-build operations..."
node scripts/post-build.js

# Ensure all scripts are executable in the dist directory
if [ -d "dist" ]; then
  echo "Making scripts in dist directory executable..."
  find dist -name "*.sh" -type f -exec chmod +x {} \;
fi

echo "Build completed successfully!"
