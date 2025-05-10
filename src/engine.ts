
/**
 * This file ensures compatibility with the deployment platform
 * by explicitly specifying Node.js engine requirements
 * 
 * For Digital Ocean App Platform deployment:
 * - Uses npm install with --legacy-peer-deps for dependency resolution
 * - Requires Node.js 22.x and npm 10.x
 * - Includes a Procfile for process type definition
 * - Uses build.sh for installation and post-build operations
 */

export const engineRequirements = {
  node: '22.x',
  npm: '10.x',
  installCommand: 'npm install --legacy-peer-deps --no-fund --no-audit',
  buildCommand: './build.sh',
  startCommand: 'npm run serve'
};

// This file is used by the build system to determine compatibility
