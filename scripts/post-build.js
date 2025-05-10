
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Copy important deployment files to the dist folder
console.log('Creating Procfile in dist directory...');
const procfileContent = 'web: npm run serve';
fs.writeFileSync(path.join(distPath, 'Procfile'), procfileContent);

// Create .npmrc in the dist folder
console.log('Creating .npmrc in dist directory...');
const npmrcContent = `
# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Prevent npm ci
ci=false

# Additional options to prevent npm ci
prefer-offline=true
fund=false
audit=false
`;

// Create fake package-lock.json in dist to prevent npm ci from failing
console.log('Creating package-lock.json in dist directory...');
fs.writeFileSync(path.join(distPath, 'package-lock.json'), '{"lockfileVersion":3,"requires":true,"packages":{}}');
fs.writeFileSync(path.join(distPath, '.npmrc'), npmrcContent);

// Create a start script for the platform to find
console.log('Creating start.sh script in dist directory...');
const startScriptContent = `#!/bin/bash
# Force npm to use install instead of ci
export NPM_CONFIG_CI=false
npm run serve
`;
fs.writeFileSync(path.join(distPath, 'start.sh'), startScriptContent);
fs.chmodSync(path.join(distPath, 'start.sh'), '755');

console.log('✅ Post-build files generated successfully');
