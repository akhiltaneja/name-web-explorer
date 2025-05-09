
/**
 * This file ensures compatibility with the deployment platform
 * by explicitly specifying Node.js engine requirements
 * 
 * For Digital Ocean App Platform deployment:
 * - Uses npm install with --legacy-peer-deps for dependency resolution
 * - Requires Node.js 22.x and npm 10.x
 */

export const engineRequirements = {
  node: '22.x',
  npm: '10.x',
  installCommand: 'npm install --legacy-peer-deps',
  buildCommand: 'npm run build'
};

// This file is used by the build system to determine compatibility
