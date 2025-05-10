
#!/bin/bash
# Install dependencies with regular npm install instead of npm ci
npm install --legacy-peer-deps

# Build the application
npm run build

# Run the post-build script to generate necessary deployment files
node scripts/post-build.js

echo "Build completed successfully with post-build operations"
