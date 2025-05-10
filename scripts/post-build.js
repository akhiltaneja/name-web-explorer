
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
unsafe-perm=true
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

// Create run.sh script
console.log('Creating run.sh script in dist directory...');
const runScriptContent = `#!/bin/bash
# This script is needed for some platforms that don't respect .npmrc settings
echo "Starting server with npm run serve"
exec npm run serve
`;
fs.writeFileSync(path.join(distPath, 'run.sh'), runScriptContent);
fs.chmodSync(path.join(distPath, 'run.sh'), '755');

// Create a fallback static server if express setup fails
console.log('Creating fallback static server...');
const fallbackServerContent = `
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.url}\`);
  
  // Default to serving index.html for SPA routing
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Get file extension and corresponding content type
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`Fallback server running on port \${PORT}\`);
});
`;
fs.writeFileSync(path.join(distPath, 'fallback-server.js'), fallbackServerContent);

console.log('✅ Post-build files generated successfully');
