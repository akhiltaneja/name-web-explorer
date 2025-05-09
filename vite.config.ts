
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { writeFileSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Generate package.json for production with required scripts
  if (mode === "production") {
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
    
    writeFileSync("dist/package.json", JSON.stringify(prodPackage, null, 2));
    
    // Create a simple Express server
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
    writeFileSync("dist/server.js", serverContent);
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Add this to help with directory imports
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    build: {
      // Improve chunking strategy
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@/components/ui/index'
            ]
          }
        }
      },
      // Ensure sourcemaps for better debugging
      sourcemap: true,
      // Improve chunk loading reliability
      chunkSizeWarningLimit: 1000,
      // Add CI environment options
      minify: 'esbuild',
      emptyOutDir: true,
      // Force packaging in modern format
      target: 'es2020',
    },
    // Add engine requirements for deployment
    optimizeDeps: {
      include: ['react-day-picker', 'date-fns'],
      // Force skip problematic dependencies during installation in CI environments
      exclude: [],
    },
    // Define Node.js version for deployment
    define: {
      'process.env.NODE_VERSION': JSON.stringify('22.x'),
      'process.env.NPM_CONFIG_LEGACY_PEER_DEPS': 'true',
    }
  };
});
