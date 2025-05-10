
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

// Create start.sh script
console.log('Creating start.sh script...');
const startScriptContent = `#!/bin/bash
# This script handles starting the server in production

# Force npm to use install instead of ci
export NPM_CONFIG_CI=false 
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Ensure we're in the dist directory
cd "$(dirname "$0")" || exit 1

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

// Create package-lock.json in dist to prevent npm ci
console.log('Creating package-lock.json in dist directory...');
fs.writeFileSync(path.join(distPath, 'package-lock.json'), '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}');

// Create .npmrc in the dist folder
console.log('Creating .npmrc in dist directory...');
const npmrcContent = `
# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Prevent npm ci
ci=false

# Additional options
prefer-offline=true
fund=false
audit=false
unsafe-perm=true
`;
fs.writeFileSync(path.join(distPath, '.npmrc'), npmrcContent);

// Create Procfile in dist
console.log('Creating Procfile in dist directory...');
const procfileContent = 'web: npm run serve';
fs.writeFileSync(path.join(distPath, 'Procfile'), procfileContent);

// Create a simple fallback static server as emergency option
console.log('Creating fallback server script...');
const fallbackServerContent = `
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
