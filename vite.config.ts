
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
      'process.env.NODE_VERSION': JSON.stringify('18.x'),
      'process.env.NPM_CONFIG_LEGACY_PEER_DEPS': 'true',
    }
  };
});
