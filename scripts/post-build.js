
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
import fs from 'fs';

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

// Create a fallback server in case dependencies fail
console.log('Creating fallback-server.js...');
const fallbackServerContent = `
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

// Simple MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(\`\${req.method} \${req.url}\`);
  
  // Handle favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Normalize URL and set file path
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // If path doesn't include file extension, treat as route and serve index.html
  if (!path.extname(filePath)) {
    filePath = path.join(__dirname, 'index.html');
  }
  
  // Get file extension for content type
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
          if (err) {
            // If we can't even serve index.html, return 500
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(\`Server Error: \${err.code}\`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`[FALLBACK] Server running on port \${PORT}\`);
});
`;

fs.writeFileSync(path.join(distPath, 'fallback-server.js'), fallbackServerContent);

// Create start.sh script
console.log('Creating start.sh script...');
const startScriptContent = `#!/bin/bash
# This script handles starting the server in production

# Print each command before executing it
set -x

# Force npm to use install instead of ci
export NPM_CONFIG_CI=false 
export NPM_CONFIG_LEGACY_PEER_DEPS=true

# Create .npmrc if not exists
if [ ! -f ".npmrc" ]; then
  echo "Creating .npmrc file..."
  cat > .npmrc << EOF
ci=false
legacy-peer-deps=true
package-lock=false
prefer-offline=true
fund=false
audit=false
EOF
fi

# Create a minimal package-lock.json if it doesn't exist
if [ ! -f "package-lock.json" ]; then
  echo "Creating minimal package-lock.json..."
  echo '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}' > package-lock.json
fi

# Install dependencies if they haven't been installed yet
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps
fi

# Start the server
echo "Starting server..."
npm run serve || node fallback-server.js
`;

fs.writeFileSync(path.join(distPath, 'start.sh'), startScriptContent);
fs.chmodSync(path.join(distPath, 'start.sh'), '755');

// Create run.sh as another fallback
console.log('Creating run.sh script...');
const runScriptContent = `#!/bin/bash
# Fallback script to start server if the start.sh fails

# Make sure to exit on error
set -e

# Try using node directly if npm fails
node server.js || node fallback-server.js || echo "Failed to start server" >&2
`;

fs.writeFileSync(path.join(distPath, 'run.sh'), runScriptContent);
fs.chmodSync(path.join(distPath, 'run.sh'), '755');

// Create .npmrc in the dist folder
console.log('Creating .npmrc in dist directory...');
const npmrcContent = `
# Force npm to use install instead of ci
ci=false
ignore-scripts=false

# Allow legacy peer dependencies to resolve conflicting versions
legacy-peer-deps=true

# Prevent npm ci
package-lock=false

# Additional options
prefer-offline=true
fund=false
audit=false
cache=false
update-notifier=false
`;
fs.writeFileSync(path.join(distPath, '.npmrc'), npmrcContent);

// Create package-lock.json in dist to prevent npm ci
console.log('Creating package-lock.json in dist directory...');
fs.writeFileSync(path.join(distPath, 'package-lock.json'), '{"name":"app","lockfileVersion":3,"requires":true,"packages":{}}');

// Create Procfile in dist
console.log('Creating Procfile in dist directory...');
const procfileContent = 'web: ./start.sh || node server.js || node fallback-server.js';
fs.writeFileSync(path.join(distPath, 'Procfile'), procfileContent);

// Install dependencies in dist folder
console.log('Installing dependencies in dist folder...');
try {
  process.chdir(distPath);
  execSync('npm install --no-package-lock --no-audit --no-fund --legacy-peer-deps', { stdio: 'inherit' });
  process.chdir(path.join(__dirname, '..'));
} catch (error) {
  console.error('Failed to install dependencies in dist folder:', error);
  // Continue anyway as we have fallbacks
}

console.log('✅ Post-build files generated successfully');
