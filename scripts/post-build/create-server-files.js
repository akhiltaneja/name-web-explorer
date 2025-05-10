
import fs from 'fs';
import path from 'path';

/**
 * Creates server files in the dist directory
 * @param {string} distPath - The path to the dist directory
 */
export function createServerFiles(distPath) {
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
      "node": "18.x",
      "npm": "9.x"
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
}
