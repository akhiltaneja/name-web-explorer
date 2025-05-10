
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
  installCommand: 'bash ./build.sh',
  buildCommand: 'echo "Build already completed in installCommand"',
  startCommand: 'bash dist/start.sh'
};

// This configuration is applied during the build process
// The installCommand now uses build.sh which handles both installation and building
// Engine requirements are aligned with Digital Ocean App Platform
