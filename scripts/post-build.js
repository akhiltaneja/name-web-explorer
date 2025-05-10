
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

console.log('Starting post-build operations...');

// Ensure the dist directory exists
if (!fs.existsSync(distPath)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(distPath, { recursive: true });
}

// Generate production package.json
console.log('Creating production package.json...');
const prodPackage = {
  "name": "vite-production-build",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "serve": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "compression": "^1.7.4"
  },
  "engines": {
    "node": "22.x",
    "npm": "10.x"
  }
};

fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(prodPackage, null, 2));

// Create Express server file
console.log('Creating server.js file...');
const serverContent = `
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// Enable compression
app.use(compression());

// Serve static files
app.use(express.static(__dirname));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Make sure to listen on 0.0.0.0 for Digital Ocean App Platform
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT} and listening on all interfaces\`);
});
`;

fs.writeFileSync(path.join(distPath, 'server.js'), serverContent);

// Create start.sh script
console.log('Creating start.sh script...');
const startScriptContent = `#!/bin/bash
# This script handles starting the server in production

# Force npm to use install instead of ci
export NPM_CONFIG_CI=false 
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Install dependencies if they haven't been installed yet
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps
fi

# Start the server
echo "Starting server..."
npm run serve
`;

fs.writeFileSync(path.join(distPath, 'start.sh'), startScriptContent);
fs.chmodSync(path.join(distPath, 'start.sh'), '755');

// Create .npmrc in the dist folder
console.log('Creating .npmrc in dist directory...');
const npmrcContent = `
# Force npm to use install instead of ci
ci=false

# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Prevent npm ci
package-lock=false

# Additional options
prefer-offline=true
fund=false
audit=false
unsafe-perm=true
`;
fs.writeFileSync(path.join(distPath, '.npmrc'), npmrcContent);

// Create package-lock.json in dist to prevent npm ci
console.log('Creating package-lock.json in dist directory...');
fs.writeFileSync(path.join(distPath, 'package-lock.json'), '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}');

// Create Procfile in dist
console.log('Creating Procfile in dist directory...');
const procfileContent = 'web: npm run serve';
fs.writeFileSync(path.join(distPath, 'Procfile'), procfileContent);

// Install dependencies in dist folder
console.log('Installing dependencies in dist folder...');
try {
  process.chdir(distPath);
  execSync('npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps', { stdio: 'inherit' });
  process.chdir(path.join(__dirname, '..'));
} catch (error) {
  console.error('Failed to install dependencies in dist folder:', error);
}

console.log('✅ Post-build files generated successfully');
