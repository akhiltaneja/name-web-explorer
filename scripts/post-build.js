
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');

// Ensure the dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Generate production package.json
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

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

fs.writeFileSync(path.join(distPath, 'server.js'), serverContent);

console.log('✅ Post-build files generated successfully');
